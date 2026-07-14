import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import type { AiAssessment } from "@/types/konsil";
import type { Patient } from "@/types/patient";
import { aiAssessmentService, type AiAssessmentInput } from "@/services/aiAssessmentService";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/utils/formatters";

// Minimal renderer for the AI response's markdown subset: "## " headings,
// "**bold**" spans, "- " bullet lists, and plain paragraphs.
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function AssessmentMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: JSX.Element[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-0.5">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  }

  lines.forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h4 key={i} className="font-semibold text-ink-900 mt-4 first:mt-0">
          {line.slice(3)}
        </h4>
      );
    } else if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2));
    } else if (line === "") {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={i} className="text-sm text-ink-700 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  });
  flushList();

  return <div className="space-y-1.5">{blocks}</div>;
}

export function AiAssessmentCard({
  data,
  patient,
  value,
  onChange,
  autoGenerate = false,
}: {
  data: AiAssessmentInput;
  patient: Patient | undefined;
  value: AiAssessment | undefined;
  onChange: (assessment: AiAssessment) => void;
  /** Generate once automatically (e.g. on the new-Konsil review step) without the user clicking anything. */
  autoGenerate?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const autoTriggered = useRef(false);

  async function generate() {
    setGenerating(true);
    setError(undefined);
    try {
      const assessment = await aiAssessmentService.generate(data, patient);
      onChange(assessment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "KI-Einschätzung fehlgeschlagen.");
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    if (autoGenerate && !autoTriggered.current && !value && !generating) {
      autoTriggered.current = true;
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate]);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-ink-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-ink-500" />
          )}
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span className="font-semibold text-ink-900">KI-Einschätzung</span>
          <Badge size="sm" className="bg-brand-50 text-brand-700 ring-brand-200">
            Beta
          </Badge>
        </div>
      </button>
      {expanded && (
        <CardBody className="border-t border-ink-100 space-y-4">
          {!value && !generating && (!autoGenerate || error) && (
            <div className="space-y-3">
              <p className="text-sm text-ink-600">
                Lässt Anamnese, Symptomdauer, betroffene Körperregionen und Patientendaten von Claude
                auswerten und liefert einen strukturierten Vorschlag zu Diagnose und Therapie.
              </p>
              <Button size="sm" onClick={generate}>
                <Sparkles className="w-4 h-4" />
                {error ? "Erneut versuchen" : "KI-Einschätzung generieren"}
              </Button>
            </div>
          )}

          {generating && (
            <div className="flex items-center gap-2 text-sm text-ink-600 py-4">
              <span className="inline-block w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              Claude analysiert die Konsildaten…
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 p-3 text-sm">
              <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {value && !generating && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-ink-500">
                  Generiert am {formatDateTime(value.generatedAt)} · {value.model}
                </span>
                <Button size="sm" variant="outline" onClick={generate}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Neu generieren
                </Button>
              </div>
              <AssessmentMarkdown content={value.content} />
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
}
