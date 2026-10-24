import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceLang = "hi-IN" | "en-IN";

/**
 * Wispr-Flow-style dictation on top of the browser's built-in speech
 * recognizer. Free, no API keys, no servers. On Android Chrome this is
 * Google's recognizer - the same engine as Gboard Hindi dictation.
 * Bhojpuri is served through the hi-IN (Hindi) model.
 */
export function useVoiceDictation() {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [lang, setLang] = useState<VoiceLang>("hi-IN");

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const wantRef = useRef(false); // true while the user wants to keep dictating
  const onFinalRef = useRef<(t: string) => void>(() => {});

  const getRec = useCallback(() => {
    if (recRef.current) return recRef.current;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0]?.transcript ?? "";
        if (res.isFinal) {
          const clean = cleanup(text);
          if (clean) onFinalRef.current(clean);
        } else {
          live += text;
        }
      }
      setInterim(live);
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantRef.current = false;
        setListening(false);
        setError("Microphone permission was blocked. Allow mic access in your browser settings and try again.");
      } else if (e.error === "network") {
        wantRef.current = false;
        setListening(false);
        setError("Voice needs an internet connection. Please check and try again.");
      }
    };

    // Auto-continue: the native recognizer ends every few seconds of
    // silence; while the user has not pressed stop, restart it so
    // dictation flows like Wispr Flow.
    rec.onend = () => {
      if (wantRef.current) {
        try {
          rec.start();
        } catch {
          /* start() called before fully stopped - the next onend retries */
        }
      } else {
        setListening(false);
        setInterim("");
      }
    };

    recRef.current = rec;
    return rec;
  }, []);

  const start = useCallback(
    (onFinal: (t: string) => void) => {
      if (!supported) return;
      onFinalRef.current = onFinal;
      setError(null);
      wantRef.current = true;
      const rec = getRec();
      if (!rec) return;
      rec.lang = lang;
      try {
        rec.start();
        setListening(true);
      } catch {
        /* already running */
      }
    },
    [supported, lang, getRec]
  );

  const stop = useCallback(() => {
    wantRef.current = false;
    recRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  // Changing language mid-session needs a restart; stop and let the user tap again.
  useEffect(() => {
    if (listening) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Never leak a live mic when the page unmounts.
  useEffect(
    () => () => {
      wantRef.current = false;
      recRef.current?.abort();
    },
    []
  );

  return { supported, listening, interim, error, lang, setLang, start, stop };
}

/** Light Wispr-style cleanup: tidy spaces, sentence case, end punctuation. */
function cleanup(t: string): string {
  let s = t.trim().replace(/\s+/g, " ");
  if (!s) return s;
  if (/[a-z]/i.test(s)) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!/[.!?]$/.test(s)) s += ".";
  } else if (!/[।.]$/.test(s)) {
    s += "।";
  }
  return s;
}
