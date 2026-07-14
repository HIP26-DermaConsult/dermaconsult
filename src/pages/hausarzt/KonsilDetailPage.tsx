import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Lock,
  Stethoscope,
  Share2,
  FilePlus2,
  CheckCircle2,
} from "lucide-react";
import { useKonsil } from "@/hooks/useKonsile";
import { usePatient } from "@/hooks/usePatients";
import { usePatientSummary } from "@/hooks/usePortal";
import { useDataRequests } from "@/hooks/useDataRequests";
import { useKonsilUploads } from "@/hooks/useKonsilUploads";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { konsilService } from "@/services/konsilService";
import { konsilUploadService } from "@/services/konsilUploadService";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { PatientSummaryCard } from "@/components/patients/PatientSummaryCard";
import { AiAssessmentCard } from "@/components/konsile/AiAssessmentCard";
import { BodyRegionSelector } from "@/components/konsile/BodyRegionSelector";
import { ImageGallery } from "@/components/konsile/ImageGallery";
import { Timeline } from "@/components/konsile/Timeline";
import { FloatingMessages } from "@/components/konsile/MessagesThreadPopup";
import { SharePatientSummaryModal } from "@/components/konsile/SharePatientSummaryModal";
import { RequestPatientDataModal } from "@/components/konsile/RequestPatientDataModal";
import { PatientUploadsCard } from "@/components/konsile/PatientUploadsCard";
import { KonsilUploadsCard } from "@/components/konsile/KonsilUploadsCard";
import { StatusBadge, UrgencyBadge } from "@/components/ui/StatusBadge";
import { CopyableLink } from "@/components/ui/CopyableLink";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatDateTime } from "@/utils/formatters";
import { lanUploadUrlForToken } from "@/utils/konsilUpload";

export default function HausarztKonsilDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { konsil, loading, refresh, setKonsil } = useKonsil(id);
  const { patient } = usePatient(konsil?.patientId);
  const { summary, refresh: refreshSummary } = usePatientSummary(konsil?.id);
  const { requests, refresh: refreshRequests } = useDataRequests(konsil?.id);
  const { uploads, needsReview, setUploads } = useKonsilUploads(konsil?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [appOrigin, setAppOrigin] = useState<string | undefined>();

  useEffect(() => {
    konsilUploadService
      .getNetworkInfo()
      .then((info) => setAppOrigin(info.appOrigin))
      .catch(() => setAppOrigin(undefined));
  }, []);

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

  async function markUploadsReviewed() {
    if (!konsil) return;
    const next = await konsilUploadService.markReviewed(konsil.id);
    setUploads(next);
    toast({ variant: "success", title: "Uploads als geprueft markiert" });
  }

  const patientUploadUrl = lanUploadUrlForToken(konsil.uploadToken, appOrigin);
  const hausarztUploadUrl = `${patientUploadUrl}?source=hausarzt`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(hausarztUploadUrl)}`;

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
            <Button variant="outline" onClick={() => setRequestOpen(true)}>
              <FilePlus2 className="w-4 h-4" /> Daten anfordern
            </Button>
            <Button variant="outline" onClick={() => setShareOpen(true)}>
              <Share2 className="w-4 h-4" /> {summary ? "Freigabe bearbeiten" : "Für Patient:in freigeben"}
            </Button>
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

          <AiAssessmentCard
            data={konsil}
            patient={patient}
            value={konsil.aiAssessment}
            onChange={async (assessment) => setKonsil(await konsilService.saveAiAssessment(konsil.id, assessment))}
          />

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

          <KonsilUploadsCard
            uploads={uploads}
            needsReview={needsReview}
            onMarkReviewed={markUploadsReviewed}
          />

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
        </div>

        <div className="space-y-6">
          {patient && <PatientSummaryCard patient={patient} />}
          <Card>
            <CardHeader
              title="Patientenfreigabe"
              action={
                summary && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Freigegeben
                  </span>
                )
              }
            />
            <CardBody className="text-sm">
              {summary ? (
                <p className="text-ink-600">
                  Für die Patientin / den Patienten freigegeben am {formatDate(summary.sharedAt)}.
                </p>
              ) : (
                <p className="text-ink-600">
                  Noch keine patientenverständliche Zusammenfassung freigegeben.
                </p>
              )}
            </CardBody>
          </Card>
          <Card className={needsReview ? "border-amber-200" : undefined}>
            <CardHeader
              title="Konsil-Upload QR"
              description="Einmaliger Link fuer dieses Konsil"
              action={
                needsReview ? (
                  <Badge size="sm" className="bg-amber-50 text-amber-700 ring-amber-200">
                    Neue Uploads
                  </Badge>
                ) : undefined
              }
            />
            <CardBody className="space-y-3">
              <div className="flex justify-center rounded-lg border border-ink-200 bg-white p-3">
                <img src={qrSrc} alt="QR-Code fuer Konsil-Upload" className="w-40 h-40" />
              </div>
              <CopyableLink url={hausarztUploadUrl} />
              <p className="text-xs text-ink-500">
                Fuer Patient:innen denselben Link ohne den Zusatz <span className="font-mono">?source=hausarzt</span> teilen.
              </p>
            </CardBody>
          </Card>
          <PatientUploadsCard requests={requests} />
          <Card>
            <CardHeader title="Verlauf" />
            <CardBody>
              <Timeline events={konsil.timeline} />
            </CardBody>
          </Card>
        </div>
      </div>


        <FloatingMessages
            messages={konsil.messages}
            description={"Thread mit der Dermatologie"}
            reply={reply}
            setReply={setReply}
            sending={sending}
            onSend={sendReply}
        />


      <SharePatientSummaryModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        konsil={konsil}
        existing={summary}
        onShared={refreshSummary}
      />
      <RequestPatientDataModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        patientId={konsil.patientId}
        konsilId={konsil.id}
        onCreated={() => {
          refreshRequests();
          refresh();
        }}
      />
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
