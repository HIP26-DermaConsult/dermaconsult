import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { dataRequestService } from "@/services/dataRequestService";
import { konsilService } from "@/services/konsilService";
import type { DataRequest } from "@/types/portal";
import type { ImageAttachment } from "@/types/konsil";
import { Logo } from "@/components/ui/Logo";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ImageUploadArea } from "@/components/upload/ImageUploadArea";

type RequestState =
  | { status: "loading" }
  | { status: "invalid"; reason: string }
  | { status: "ready"; request: DataRequest };

export default function PatientUploadPage() {
  const { token } = useParams();
  const [state, setState] = useState<RequestState>({ status: "loading" });
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        setState({ status: "invalid", reason: "Kein gültiger Link." });
        return;
      }
      const req = await dataRequestService.getByToken(token);
      if (!active) return;
      if (!req) {
        setState({ status: "invalid", reason: "Dieser Link ist ungültig." });
      } else if (req.status === "expired") {
        setState({ status: "invalid", reason: "Dieser Link ist abgelaufen." });
      } else {
        setState({ status: "ready", request: req });
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  async function handleSubmit() {
    if (!token || images.length === 0) return;
    setSubmitting(true);
    try {
      await dataRequestService.submitUpload(token, { images, note: note.trim() || undefined });
      const konsilId = state.status === "ready" ? state.request.konsilId : undefined;
      if (konsilId) {
        await konsilService.addTimelineEvent(konsilId, {
          type: "note",
          by: "Patient:in",
          description: `Angeforderte Daten hochgeladen (${images.length} Bild(er))`,
        });
      }
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
            <ShieldCheck className="w-3.5 h-3.5" /> Sichere, verschlüsselte Übertragung
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
            title="Upload nicht möglich"
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
            description="Ihre Daten wurden sicher übermittelt und stehen Ihrer Praxis nun zur Verfügung. Sie können dieses Fenster schließen."
          />
        )}

        {state.status === "ready" && !done && (
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-violet-600" /> Zusätzliche Daten hochladen
                </span>
              }
              description={`Anfrage von ${state.request.requestedByName}`}
            />
            <CardBody className="space-y-5">
              <div className="rounded-lg bg-violet-50 ring-1 ring-violet-200 px-4 py-3 text-sm text-violet-900">
                {state.request.message}
              </div>

              <div>
                <div className="text-sm font-medium text-ink-800 mb-2">Bilder hinzufügen</div>
                <ImageUploadArea images={images} onChange={setImages} />
              </div>

              <Field label="Anmerkung (optional)" htmlFor="note">
                <Textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="z. B. Beschreibung der Beschwerden oder seit wann sie bestehen…"
                />
              </Field>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} loading={submitting} disabled={images.length === 0}>
                  <UploadCloud className="w-4 h-4" /> Sicher übermitteln
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}
