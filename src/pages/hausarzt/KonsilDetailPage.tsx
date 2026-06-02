import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Lock,
  MessageSquarePlus,
  Send,
  Stethoscope,
} from "lucide-react";
import { useKonsil } from "@/hooks/useKonsile";
import { usePatient } from "@/hooks/usePatients";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { konsilService } from "@/services/konsilService";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { PatientSummaryCard } from "@/components/patients/PatientSummaryCard";
import { BodyRegionSelector } from "@/components/konsile/BodyRegionSelector";
import { ImageGallery } from "@/components/konsile/ImageGallery";
import { Timeline } from "@/components/konsile/Timeline";
import { MessageThread } from "@/components/konsile/MessageThread";
import { StatusBadge, UrgencyBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime } from "@/utils/formatters";

export default function HausarztKonsilDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { konsil, loading, refresh } = useKonsil(id);
  const { patient } = usePatient(konsil?.patientId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  if (loading || !konsil) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/4" />
        </CardBody>
      </Card>
    );
  }

  async function sendReply() {
    if (!konsil || !user || !reply.trim()) return;
    setSending(true);
    try {
      await konsilService.addMessage(konsil.id, {
        senderRole: user.role,
        senderName: user.name,
        body: reply.trim(),
      });
      setReply("");
      await refresh();
      toast({ variant: "success", title: "Nachricht gesendet" });
    } finally {
      setSending(false);
    }
  }

  async function closeKonsil() {
    if (!konsil || !user) return;
    await konsilService.updateStatus(konsil.id, "closed", user.name);
    await refresh();
    toast({ variant: "success", title: "Konsil abgeschlossen" });
  }

  return (
    <>
      <PageHeader
        title={`${konsil.id}`}
        description={konsil.reason}
        breadcrumbs={
          <Link to="/konsile" className="hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Zurück zu Konsilen
          </Link>
        }
        action={
          <>
            <Button variant="outline">
              <Download className="w-4 h-4" /> Befund (PDF)
            </Button>
            {konsil.status !== "closed" && (
              <Button variant="outline" onClick={closeKonsil}>
                <Lock className="w-4 h-4" /> Konsil schließen
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <StatusBadge status={konsil.status} size="sm" />
                  <UrgencyBadge urgency={konsil.urgency} size="sm" />
                </div>
              }
              description={`Erstellt am ${formatDateTime(konsil.createdAt)}`}
            />
            <CardBody className="grid sm:grid-cols-2 gap-4 text-sm">
              <Info label="Fragestellung">{konsil.reason}</Info>
              <Info label="Symptomdauer">{konsil.symptomDuration}</Info>
              <Info label="Verdachtsdiagnose">{konsil.suspectedDiagnosis ?? "—"}</Info>
              <Info label="Bisherige Therapie">{konsil.previousTreatments ?? "—"}</Info>
              <Info label="Anamnese / Befund" full>
                <p className="whitespace-pre-wrap">{konsil.clinicalDescription}</p>
              </Info>
              {konsil.additionalInfo && (
                <Info label="Weitere Hinweise" full>
                  <p className="whitespace-pre-wrap">{konsil.additionalInfo}</p>
                </Info>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Betroffene Körperregionen" />
            <CardBody>
              <BodyRegionSelector value={konsil.selectedBodyRegions} readOnly />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Bilddokumentation" description={`${konsil.images.length} Bild(er)`} />
            <CardBody>
              <ImageGallery images={konsil.images} />
            </CardBody>
          </Card>

          {konsil.expertAssessment && (
            <Card className="border-emerald-200">
              <CardHeader
                title={
                  <span className="flex items-center gap-2 text-emerald-800">
                    <Stethoscope className="w-4 h-4" />
                    Befund der Dermatologie
                  </span>
                }
                description={`${konsil.expertAssessment.authoredBy} · ${formatDateTime(
                  konsil.expertAssessment.authoredAt
                )}`}
              />
              <CardBody className="space-y-4 text-sm">
                <Info label="Einschätzung" full>
                  <p className="whitespace-pre-wrap">{konsil.expertAssessment.assessment}</p>
                </Info>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Info label="Empfohlene Diagnose">{konsil.expertAssessment.recommendedDiagnosis}</Info>
                  <Info label="Differentialdiagnosen">
                    {konsil.expertAssessment.differentialDiagnoses.join(", ") || "—"}
                  </Info>
                  <Info label="Therapieempfehlung" full>
                    {konsil.expertAssessment.recommendedTreatment}
                  </Info>
                  <Info label="Nächste Schritte" full>
                    {konsil.expertAssessment.nextSteps}
                  </Info>
                  <Info label="In-Person-Termin empfohlen">
                    {konsil.expertAssessment.inPersonAppointmentRecommended ? "Ja" : "Nein"}
                  </Info>
                  <Info label="Dringlichkeitsempfehlung">
                    <UrgencyBadge urgency={konsil.expertAssessment.urgencyRecommendation} size="sm" />
                  </Info>
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Kommunikation" description="Thread mit der Dermatologie" />
            <CardBody className="space-y-4">
              <MessageThread messages={konsil.messages} />
              {konsil.status !== "closed" && (
                <div className="border-t border-ink-100 pt-4 space-y-2">
                  <Textarea
                    rows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Antwort oder Zusatzinformation an die Dermatologie…"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setReply("")} disabled={!reply}>
                      <MessageSquarePlus className="w-4 h-4" /> Verwerfen
                    </Button>
                    <Button onClick={sendReply} loading={sending} disabled={!reply.trim()}>
                      <Send className="w-4 h-4" /> Senden
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {patient && <PatientSummaryCard patient={patient} />}
          <Card>
            <CardHeader title="Verlauf" />
            <CardBody>
              <Timeline events={konsil.timeline} />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

function Info({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <div className="text-xs text-ink-500 mb-0.5">{label}</div>
      <div className="text-ink-900">{children}</div>
    </div>
  );
}
