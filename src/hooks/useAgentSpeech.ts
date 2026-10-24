import { useCallback, useEffect, useRef } from "react";

/**
 * Speech engine for the VoiceUp voice agent.
 * Talk = browser speechSynthesis (Google Hindi voice on Android, free).
 * Listen = browser SpeechRecognition (same engine as Gboard dictation).
 * No API keys, no servers.
 */

export function useAgentSpeech(lang: "hi-IN" | "en-IN") {
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Pick a Hindi (or English) system voice; voices load async in Chrome.
  useEffect(() => {
    const pick = () => {
      const voices = window.speechSynthesis?.getVoices?.() ?? [];
      voiceRef.current =
        voices.find((v) => v.lang?.toLowerCase().startsWith(lang.slice(0, 2))) ??
        voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ??
        null;
    };
    pick();
    window.speechSynthesis?.addEventListener?.("voiceschanged", pick);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", pick);
  }, [lang]);

  const supportedListen =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const supportedTalk = typeof window !== "undefined" && "speechSynthesis" in window;

  /** Say something out loud. Resolves when the voice finishes (or immediately if TTS unavailable). */
  const talk = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        if (!supportedTalk) return resolve();
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        if (voiceRef.current) u.voice = voiceRef.current;
        u.rate = 0.98;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
        // Safety: never hang longer than text length implies
        setTimeout(resolve, Math.max(4000, text.length * 130));
      }),
    [lang, supportedTalk]
  );

  /**
   * Listen for one answer. Collects recognized sentences; resolves when the
   * user pauses after saying something, or on timeout.
   */
  const listen = useCallback(
    (timeoutMs = 15000) =>
      new Promise<string>((resolve) => {
        if (!supportedListen) return resolve("");
        const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new Ctor();
        recRef.current?.abort();
        recRef.current = rec;
        rec.lang = lang;
        rec.continuous = true;
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        let finals = "";
        let silenceTimer: ReturnType<typeof setTimeout> | null = null;
        let done = false;
        const finish = (val: string) => {
          if (done) return;
          done = true;
          if (silenceTimer) clearTimeout(silenceTimer);
          try { rec.stop(); } catch { /* noop */ }
          resolve(val.trim());
        };
        const armSilence = () => {
          if (silenceTimer) clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => finish(finals), 2200); // user paused -> answer done
        };

        rec.onresult = (e) => {
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finals += (finals ? " " : "") + (e.results[i][0]?.transcript ?? "");
          }
          if (finals) armSilence();
        };
        rec.onerror = (e) => {
          if (e.error === "no-speech" || e.error === "aborted") return;
          finish(finals);
        };
        rec.onend = () => {
          // Engine dropped (long pause). If we have anything, accept; else restart until timeout.
          if (done) return;
          if (finals) { finish(finals); return; }
          try { rec.start(); } catch { finish(""); }
        };

        setTimeout(() => finish(finals), timeoutMs); // hard timeout
        try { rec.start(); } catch { finish(""); }
      }),
    [lang, supportedListen]
  );

  const stopEverything = useCallback(() => {
    window.speechSynthesis?.cancel();
    recRef.current?.abort();
  }, []);

  useEffect(() => () => stopEverything(), [stopEverything]);

  return { talk, listen, stopEverything, supportedListen, supportedTalk };
}
