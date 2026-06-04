import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, Camera, CheckCircle2, ShieldCheck, UploadCloud, X } from "lucide-react";
import { konsilUploadService } from "@/services/konsilUploadService";
import type { KonsilUploadSource } from "@/types/konsil";
import { Logo } from "@/components/ui/Logo";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";

type PageState =
  | { status: "loading" }
  | { status: "invalid"; reason: string }
  | { status: "ready"; konsilId: string };

export default function PatientUploadPage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const source = useMemo<KonsilUploadSource>(() => {
    const raw = searchParams.get("source");
    return raw === "hausarzt" ? "hausarzt" : "patient";
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        setState({ status: "invalid", reason: "Kein gueltiger Link." });
        return;
      }
      try {
        const target = await konsilUploadService.getTarget(token);
        if (active) setState({ status: "ready", konsilId: target.konsilId });
      } catch (error) {
        if (active) {
          setState({
            status: "invalid",
            reason:
              error instanceof TypeError
                ? "Der Upload-Server ist nicht erreichbar. Bitte starten Sie npm run backend."
                : "Dieser Upload-Link ist ungueltig.",
          });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  function addFiles(next: FileList | null) {
    if (!next) return;
    setFiles((prev) => [...prev, ...Array.from(next).filter((file) => file.type.startsWith("image/"))]);
  }

  async function handleSubmit() {
    if (!token || files.length === 0) return;
    setSubmitting(true);
    try {
      await konsilUploadService.submit(token, {
        files,
        source,
        note: note.trim() || undefined,
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="bg-white border-b border-ink-200">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-ink-500">
            <ShieldCheck className="w-3.5 h-3.5" /> Demo Upload
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {state.status === "loading" && (
          <Card>
            <CardBody className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-24 w-full" />
            </CardBody>
          </Card>
        )}

        {state.status === "invalid" && (
          <EmptyState
            icon={<AlertTriangle className="w-5 h-5" />}
            title="Upload nicht moeglich"
            description={state.reason}
            action={
              <Link to="/login" className="text-brand-700 hover:underline text-sm">
                Zur Anmeldung
              </Link>
            }
          />
        )}

        {state.status === "ready" && done && (
          <EmptyState
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            title="Vielen Dank!"
            description="Die Bilder und Ihre Anmerkung wurden dem Konsil hinzugefuegt."
          />
        )}

        {state.status === "ready" && !done && (
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-violet-600" /> Bilder zum Konsil hochladen
                </span>
              }
              description={`Ziel: ${state.konsilId}`}
              action={
                <Badge className="bg-ink-100 text-ink-700 ring-ink-200">
                  {source === "hausarzt" ? "Hausarzt:in" : "Patient:in"}
                </Badge>
              }
            />
            <CardBody className="space-y-5">
              <div
                className="rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 p-6 text-center"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  addFiles(event.dataTransfer.files);
                }}
              >
                <Camera className="w-7 h-7 mx-auto text-ink-400" />
                <div className="mt-2 text-sm font-medium text-ink-800">Fotos aufnehmen oder auswaehlen</div>
                <div className="text-xs text-ink-500 mt-0.5">Die Dateien werden direkt zum Konsil hochgeladen.</div>
                <div className="mt-3">
                  <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                    <Camera className="w-4 h-4" /> Bilder auswaehlen
                  </Button>
                  <input
                    ref={inputRef}
                    hidden
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={(event) => addFiles(event.target.files)}
                  />
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-ink-800">Ausgewaehlte Bilder ({files.length})</div>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm">
                        <span className="truncate text-ink-800">{file.name}</span>
                        <button
                          type="button"
                          className="p-1 rounded-md text-ink-400 hover:text-rose-600 hover:bg-rose-50"
                          aria-label="Bild entfernen"
                          onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Field label="Kommentar (optional)" htmlFor="note">
                <Textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="z. B. Seit gestern staerker geroetet oder neue Stelle am Arm..."
                />
              </Field>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} loading={submitting} disabled={files.length === 0}>
                  <UploadCloud className="w-4 h-4" /> Zum Konsil hinzufuegen
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}
