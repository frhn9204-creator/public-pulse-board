import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";

/**
 * Press-to-talk voice input for the report form. Hindi/Bhojpuri by default
 * (Bhojpuri is understood through the Hindi recognizer), English optional.
 * Final sentences are appended to the target field as they are recognized.
 */
export function VoiceDictation({ onAppend }: { onAppend: (text: string) => void }) {
  const v = useVoiceDictation();

  if (!v.supported) {
    return (
      <p className="text-xs text-muted-foreground">
        Voice input is not available in this browser. It works best in Chrome.
      </p>
    );
  }

  const toggle = () =>
    v.listening ? v.stop() : v.start((t) => onAppend(t));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={v.listening ? "destructive" : "secondary"}
          onClick={toggle}
          className="gap-2"
          aria-pressed={v.listening}
        >
          {v.listening ? (
            <>
              <Square className="h-4 w-4 animate-pulse" /> Stop
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" /> Speak
            </>
          )}
        </Button>

        <div className="flex rounded-full border overflow-hidden text-xs">
          {([
            ["hi-IN", "हिंदी · भोजपुरी"],
            ["en-IN", "English"],
          ] as const).map(([code, label]) => (
            <button
              key={code}
              type="button"
              onClick={() => v.setLang(code)}
              className={`px-3 py-1.5 transition-colors ${
                v.lang === code
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {v.listening && (
          <span className="text-xs text-muted-foreground animate-pulse">
            सुन रहे हैं… speak now
          </span>
        )}
      </div>

      {v.interim && (
        <p className="text-sm italic text-muted-foreground min-h-[20px]">
          {v.interim}
        </p>
      )}
      {v.error && <p className="text-xs text-red-500">{v.error}</p>}

      <p className="text-xs text-muted-foreground">
        Tap Speak and describe the problem in your own words — it types for you.
      </p>
    </div>
  );
}
