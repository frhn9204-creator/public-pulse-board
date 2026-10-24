import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgentSpeech } from "@/hooks/useAgentSpeech";
import { supabase } from "@/integrations/supabase/client";

/**
 * VoiceUp voice agent — a floating interviewer that talks to the citizen,
 * asks the report questions one by one, and files the issue by voice.
 * Designed for citizens who cannot read or write.
 */

type Lang = "hi-IN" | "en-IN";
type Status = "closed" | "idle" | "speaking" | "listening" | "submitting" | "done";
type Step = "intro" | "problem" | "category" | "urgency" | "org" | "area" | "pincode" | "recap";

const STEP_ORDER: Step[] = ["intro", "problem", "category", "urgency", "org", "area", "pincode", "recap"];

const CATS: [string, string[], string][] = [
  ["infrastructure", ["सड़क", "गड्ढा", "रोड", "पथरीन", "सड़क", "bridge", "पुल", "पानी", "नल", "water", "नाली", "drain", "बिजली", "light", "बत्ती", "streetlight", "बिल्डिंग", "building", "अवसर"], "Infrastructure"],
  ["cleanliness", ["कचरा", "गंदगी", "सफाई", "कूड़ा", "garbage", "waste", "clean", "dirty", "मलबा"], "Cleanliness"],
  ["healthcare", ["अस्पताल", "हॉस्पिटल", "स्वास्थ्य", "दवा", "मरीज", "health", "hospital", "doctor", "डॉक्टर"], "Healthcare"],
  ["education", ["स्कूल", "पढ़ाई", "शिक्षा", "school", "education", "teacher", "टीचर"], "Education"],
  ["safety", ["सुरक्षा", "हादसा", "accident", "danger", "खतरा", "safety", "crime", "चोरी", "आग", "fire"], "Safety"],
  ["corruption", ["रिश्वत", "भ्रष्टाचार", "bribe", "corruption", "पैसा मांगा"], "Corruption"],
  ["other", [], "Other"],
];

const ORGS: [string, string[], string][] = [
  ["Municipal Corporation", ["नगर निगम", "निगम", "municipal", "nagar nigam"], "Municipal Corporation"],
  ["Water Supply Department", ["पानी", "जल", "जल बोर्ड", "water", "नल"], "Water Supply Department"],
  ["Public Works Department (Roads)", ["सड़क", "पथरीन", "roads", "pwd", "public works"], "Public Works Department"],
  ["Electricity Board", ["बिजली", "बत्ती", "electricity", "power", "light"], "Electricity Board"],
  ["Police Department", ["पुलिस", "police", "थाना"], "Police Department"],
  ["Traffic Police", ["ट्रैफिक", "traffic", "यातायात", "जाम"], "Traffic Police"],
  ["Public Health Department", ["स्वास्थ्य", "हॉस्पिटल", "अस्पताल", "health", "hospital"], "Public Health Department"],
  ["Waste Management Department", ["कचरा", "कूड़ा", "garbage", "waste"], "Waste Management Department"],
  ["Education Department", ["स्कूल", "शिक्षा", "education", "school"], "Education Department"],
  ["Fire Department", ["आग", "fire", "फायर"], "Fire Department"],
  ["Transport Department", ["बस", "ट्रांसपोर्ट", "transport"], "Transport Department"],
  ["Other Government Agency", [], "Other Government Agency"],
];

const URGENCY: [string, string[], string][] = [
  ["critical", ["बहुत ज़रूरी", "बहुत जरूरी", "तुरंत", "critical", "emergency", "आपातकाल"], "Critical"],
  ["high", ["ज़रूरी", "जरूरी", "high", "important"], "High"],
  ["medium", ["ठीक", "मध्यम", "medium", "normal", "सामान्य"], "Medium"],
  ["low", ["कम", "low", "छोटी"], "Low"],
];

export function VoiceAgent() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("hi-IN");
  const { talk, listen, stopEverything, supportedListen } = useAgentSpeech(lang);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("closed");
  const [step, setStep] = useState<Step>("intro");
  const [agentLine, setAgentLine] = useState("");
  const [userLine, setUserLine] = useState("");
  const busyRef = useRef(false);
  const [answers, setAnswers] = useState({
    description: "", category: "", categoryLabel: "", urgency: "", urgencyLabel: "",
    organization: "", location: "", pincode: "", state: "Bihar",
  });
  const aRef = useRef(answers);
  aRef.current = answers;

  const t = (hi: string, en: string) => (lang === "hi-IN" ? hi : en);

  const yes = (s: string) => /हाँ|हां|जी हाँ|हाँजी|yes|yeah|सही|ठीक है|ok|ओके/i.test(s);
  const no = (s: string) => /नहीं|नही|ना|no|गलत|cancel/i.test(s);

  const askAndListen = useCallback(
    async (sayHi: string, sayEn: string) => {
      const q = t(sayHi, sayEn);
      setAgentLine(q);
      setStatus("speaking");
      await talk(q);
      setStatus("listening");
      setUserLine("…");
      const heard = await listen();
      setUserLine(heard);
      return heard;
    },
    [talk, listen, lang]
  );

  const confirm = useCallback(
    async (label: string): Promise<boolean> => {
      for (let i = 0; i < 2; i++) {
        const ans = await askAndListen(
          `मैंने समझा — ${label}. सही है? हाँ या नहीं बोलिए।`,
          `I understood ${label}. Is that correct? Say yes or no.`
        );
        if (yes(ans)) return true;
        if (no(ans)) return false;
      }
      return false;
    },
    [askAndListen]
  );

  const pickMatch = (list: [string, string[], string][], text: string) => {
    const s = text.toLowerCase();
    for (const [id, kws, label] of list) if (kws.some((k) => s.includes(k))) return { id, label };
    return null;
  };

  const submitReport = useCallback(async () => {
    const a = aRef.current;
    setStatus("submitting");
    setAgentLine(t("रिपोर्ट दर्ज कर रहा हूँ…", "Filing your report…"));
    const title = a.description.split(/\s+/).slice(0, 8).join(" ").slice(0, 80);
    const payload = {
      title, description: a.description, category: a.category || "other",
      urgency: a.urgency || "medium", organization: a.organization || "Other Government Agency",
      location: a.location ? `${a.location}, Bihar, India` : null, pincode: a.pincode || null,
      status: "open",
    };
    try {
      const { data, error } = await supabase.from("issues").insert(payload).select("id").single();
      if (!error && data?.id) {
        setAgentLine(t("हो गया! आपकी रिपोर्ट दर्ज हो गई और सबको दिखेगी।", "Done! Your report is filed and public."));
        setStatus("done");
        await talk(t("हो गया! आपकी रिपोर्ट दर्ज हो गई और सबको दिखेगी।", "Done! Your report is filed and public."));
        navigate(`/issues/${data.id}`);
        setOpen(false);
        return;
      }
      throw error ?? new Error("insert failed");
    } catch {
      // Direct insert blocked (e.g. not signed in) -> hand off to the form, prefilled.
      sessionStorage.setItem("voiceup_prefill", JSON.stringify(payload));
      setAgentLine(t("फॉर्म तैयार है — बस हरा Submit बटन दबाइए।", "Your form is ready — just press the green Submit button."));
      await talk(t("फॉर्म तैयार है। बस सबमिट बटन दबाइए।", "Your form is ready. Just press the submit button."));
      navigate("/submit");
      setOpen(false);
    }
  }, [navigate, talk, lang]);

  const runStep = useCallback(
    async (s: Step) => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        if (s === "intro") {
          const ans = await askAndListen(
            "नमस्ते! मैं VoiceUp की आवाज़ सहायक हूँ। बोलकर शिकायत दर्ज कर सकते हैं — पढ़ने की ज़रूरत नहीं। शुरू करें?",
            "Hello! I am the VoiceUp voice assistant. You can report a problem by just speaking. Shall we start?"
          );
          setStep("problem");
          return; // next step runs below
        }
        if (s === "problem") {
          const ans = await askAndListen(
            "अपनी समस्या विस्तार से बताइए — क्या है, कहाँ, और कब से?",
            "Describe your problem in detail — what it is, where, and since when?"
          );
          if (ans.length > 4) {
            setAnswers((a) => ({ ...a, description: ans }));
            setStep("category");
            return;
          }
          setStep("problem"); // re-ask
          return;
        }
        if (s === "category") {
          const ans = await askAndListen(
            "यह किस तरह की समस्या है — सड़क, कचरा, स्वास्थ्य, शिक्षा, सुरक्षा, भ्रष्टाचार, या अन्य?",
            "What type of problem is it — road, garbage, health, education, safety, corruption, or other?"
          );
          const m = pickMatch(CATS, ans);
          if (m && (await confirm(m.label))) {
            setAnswers((a) => ({ ...a, category: m.id, categoryLabel: m.label }));
            setStep("urgency");
            return;
          }
          setAnswers((a) => ({ ...a, category: "other", categoryLabel: "Other" }));
          setStep("urgency");
          return;
        }
        if (s === "urgency") {
          const ans = await askAndListen(
            "कितनी ज़रूरी है — बहुत ज़रूरी, ज़रूरी, ठीक-ठाक, या कम?",
            "How urgent is it — critical, high, medium, or low?"
          );
          const m = pickMatch(URGENCY, ans);
          setAnswers((a) => ({ ...a, urgency: m?.id ?? "medium", urgencyLabel: m?.label ?? "Medium" }));
          setStep("org");
          return;
        }
        if (s === "org") {
          const ans = await askAndListen(
            "किस विभाग से यह जुड़ी है? जैसे नगर निगम, पानी, बिजली, पुलिस, सड़क विभाग…",
            "Which department is responsible — municipal corporation, water, electricity, police, roads…?"
          );
          const m = pickMatch(ORGS, ans);
          if (m && (await confirm(m[0]))) {
            setAnswers((a) => ({ ...a, organization: m[0] }));
            setStep("area");
            return;
          }
          setAnswers((a) => ({ ...a, organization: "Other Government Agency" }));
          setStep("area");
          return;
        }
        if (s === "area") {
          const ans = await askAndListen(
            "इलाके का नाम बताइए — जैसे खजेकलान, गुरहट्टा…",
            "What is your area or locality called?"
          );
          if (ans.length > 1) setAnswers((a) => ({ ...a, location: ans }));
          setStep("pincode");
          return;
        }
        if (s === "pincode") {
          const ans = await askAndListen(
            "अगर पता हो तो पिनकोड बताइए, नहीं तो 'नहीं' कहिए।",
            "If you know it, say your pincode — otherwise say no."
          );
          const digits = (ans.match(/\d{6}/) ?? [])[0] ?? "";
          if (digits) setAnswers((a) => ({ ...a, pincode: digits }));
          setStep("recap");
          return;
        }
        if (s === "recap") {
          const a = aRef.current;
          const recap = t(
            `तो यह रहा — समस्या: ${a.description.slice(0, 60)}. तरह: ${a.categoryLabel}. ज़रूरत: ${a.urgencyLabel}. विभाग: ${a.organization}. इलाका: ${a.location || "नहीं बताया"}. दर्ज कर दूँ?`,
            `Here is your report — ${a.description.slice(0, 60)}. Type: ${a.categoryLabel}. Urgency: ${a.urgencyLabel}. Department: ${a.organization}. Area: ${a.location || "not given"}. File it?`
          );
          setAgentLine(recap);
          setStatus("speaking");
          await talk(recap);
          setStatus("listening");
          const ans = await listen();
          if (no(ans)) {
            setStep("problem");
            return;
          }
          await submitReport();
        }
      } finally {
        busyRef.current = false;
      }
    },
    [askAndListen, confirm, listen, submitReport, talk, lang]
  );

  // Chain steps: whenever step changes and panel is open, run that step (once).
  const stepRef = useRef<Step | null>(null);
  useEffect(() => {
    if (!open) return;
    if (stepRef.current === step) return;
    stepRef.current = step;
    runStep(step);
  }, [step, open, runStep]);

  const openPanel = () => {
    setOpen(true);
    setStatus("idle");
    stepRef.current = null;
    setStep("intro");
  };
  const closePanel = () => {
    stopEverything();
    busyRef.current = false;
    stepRef.current = null;
    setOpen(false);
    setStatus("closed");
  };

  const stepNum = STEP_ORDER.indexOf(step) + 1;

  if (!supportedListen) return null; // browsers without voice: hide the button entirely

  return (
    <>
      {!open && (
        <button
          onClick={openPanel}
          aria-label="Voice assistant"
          className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-[#E87A2C] text-white shadow-lg shadow-black/25 hover:scale-105 transition-transform flex items-center justify-center"
        >
          <Mic className="h-6 w-6" />
          <span className="absolute inset-0 rounded-full animate-ping bg-[#E87A2C]/30" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(92vw,360px)] rounded-2xl bg-white shadow-2xl border border-border flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#17263F] text-white">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${status === "listening" ? "bg-red-400 animate-pulse" : status === "speaking" ? "bg-green-400 animate-pulse" : "bg-white/60"}`} />
              <span className="text-sm font-semibold">VoiceUp आवाज़ सहायक</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(l => l === "hi-IN" ? "en-IN" : "hi-IN")}
                className="text-xs rounded-full border border-white/30 px-2 py-0.5"
              >
                {lang === "hi-IN" ? "हिंदी" : "EN"}
              </button>
              <button onClick={closePanel} aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="px-4 py-3 space-y-3 max-h-[46vh] overflow-y-auto">
            <div className="flex items-start gap-2">
              <div className={`h-8 w-8 shrink-0 rounded-full bg-[#E87A2C]/15 flex items-center justify-center ${status === "speaking" ? "animate-pulse" : ""}`}>
                <Volume2 className="h-4 w-4 text-[#E87A2C]" />
              </div>
              <p className="text-sm leading-snug bg-muted rounded-xl rounded-tl-none px-3 py-2">{agentLine}</p>
            </div>
            {userLine && status !== "done" && (
              <p className="text-sm italic text-muted-foreground text-right">"{userLine}"</p>
            )}
            {aRef.current.description && step !== "problem" && step !== "intro" && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {aRef.current.categoryLabel && <span className="text-[11px] rounded-full bg-muted px-2 py-0.5">{aRef.current.categoryLabel}</span>}
                {aRef.current.urgencyLabel && <span className="text-[11px] rounded-full bg-muted px-2 py-0.5">{aRef.current.urgencyLabel}</span>}
                {aRef.current.organization && <span className="text-[11px] rounded-full bg-muted px-2 py-0.5">{aRef.current.organization}</span>}
                {aRef.current.location && <span className="text-[11px] rounded-full bg-muted px-2 py-0.5">{aRef.current.location}</span>}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t flex items-center justify-between bg-white">
            <span className="text-xs text-muted-foreground">
              {status === "submitting" ? "…" : `${t("प्रश्न", "Question")} ${stepNum}/8`}
            </span>
            {status === "listening" && <span className="text-xs text-red-500 animate-pulse">{t("सुन रहा हूँ…", "Listening…")}</span>}
            {status === "speaking" && <span className="text-xs text-green-600">{t("बोल रहा हूँ…", "Speaking…")}</span>}
            <Button variant="ghost" size="sm" onClick={closePanel}>{t("बंद करें", "Close")}</Button>
          </div>
        </div>
      )}
    </>
  );
}
