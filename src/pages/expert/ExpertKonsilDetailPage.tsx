import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Lock, Save, Send, Eye, FilePlus2 } from "lucide-react";
import { useKonsil } from "@/hooks/useKonsile";
import { usePatient } from "@/hooks/usePatients";
import { useDataRequests } from "@/hooks/useDataRequests";
import { useKonsilUploads } from "@/hooks/useKonsilUploads";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { konsilService } from "@/services/konsilService";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { PatientSummaryCard } from "@/components/patients/PatientSummaryCard";
import { AiAssessmentCard } from "@/components/konsile/AiAssessmentCard";
import { BodyRegionSelector } from "@/components/konsile/BodyRegionSelector";
import { ImageGallery } from "@/components/konsile/ImageGallery";
import { Timeline } from "@/components/konsile/Timeline";
import { FloatingMessages } from "@/components/konsile/MessagesThreadPopup";
import { RequestPatientDataModal } from "@/components/konsile/RequestPatientDataModal";
import { PatientUploadsCard } from "@/components/konsile/PatientUploadsCard";
import { KonsilUploadsCard } from "@/components/konsile/KonsilUploadsCard";
import { StatusBadge, UrgencyBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ExpertAssessment, Urgency } from "@/types/konsil";
import { formatDateTime } from "@/utils/formatters";
import { Modal } from "@/components/ui/Modal";

const STORAGE_PREFIX = "derma_consult_draft_";

export default function ExpertKonsilDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { konsil, loading, refresh, setKonsil } = useKonsil(id);
  const { patient } = usePatient(konsil?.patientId);
  const { requests, refresh: refreshRequests } = useDataRequests(konsil?.id);
  const { uploads, needsReview } = useKonsilUploads(konsil?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [requestOpen, setRequestOpen] = useState(false);

  const [internalNote, setInternalNote] = useState("");
  const [a, setA] = useState<ExpertAssessment>({
    assessment:
      "Die übersandten Aufnahmen zeigen ein ca. 8 mm großes, flaches Pigmentmal am dorsalen rechten Unterarm. Dermoskopisch imponiert ein unregelmäßiges Pigmentnetz mit fokaler Unterbrechung am Randbereich sowie eine inhomogene Braun-Schwarz-Tönung zentral. Eine Regression oder ein blau-weißer Schleier ist nicht eindeutig nachweisbar. Das Gesamtbild entspricht einem klinisch atypischen melanozytären Nävus (Clark-Nävus Grad II–III). Ein malignes Melanom in Frühstadium kann anhand der vorliegenden Bildgebung nicht mit ausreichender Sicherheit ausgeschlossen werden.",
    recommendedDiagnosis: "Atypischer melanozytärer Nävus (Clark-Nävus), DD: Malignes Melanom in situ (D03.6)",
    differentialDiagnoses: ["Malignes Melanom in situ", "Dysplastischer Nävus", "Pigmentiertes Basalzellkarzinom"],
    recommendedTreatment:
      "Exzision des Pigmentmals mit einem Sicherheitsabstand von mindestens 2 mm und anschließende histopathologische Aufarbeitung. Keine topische Therapie indiziert.",
    nextSteps:
      "Zeitnahe Überweisung in die dermatologische Ambulanz zur Exzisionsplanung. Lichtschutz der Läsion bis zur Entfernung empfohlen. Nach Histologie ggf. Nachexzision je nach Breslow-Dicke.",
    inPersonAppointmentRecommended: true,
    urgencyRecommendation: "soon",
    authoredAt: "",
    authoredBy: "",
  });
  const [rueckfrageOpen, setRueckfrageOpen] = useState(false);
  const [rueckfrageText, setRueckfrageText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!konsil) return;
    const draft = localStorage.getItem(STORAGE_PREFIX + konsil.id);
    if (draft) {
      try {
        setA(JSON.parse(draft));
      } catch {
        /* ignore */
      }
    } else if (konsil.expertAssessment) {
      setA(konsil.expertAssessment);
    }
  }, [konsil]);

  if (loading || !konsil) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-2/3" />
        </CardBody>
      </Card>
    );
  }

  function update<K extends keyof ExpertAssessment>(key: K, value: ExpertAssessment[K]) {
    setA((prev) => ({ ...prev, [key]: value }));
  }

  function saveDraft() {
    if (!konsil) return;
    localStorage.setItem(STORAGE_PREFIX + konsil.id, JSON.stringify(a));
    toast({ variant: "success", title: "Entwurf gespeichert" });
  }

  async function startReview() {
    if (!konsil || !user) return;
    await konsilService.updateStatus(konsil.id, "in_review", user.name);
    await refresh();
    toast({ variant: "info", title: "Begutachtung gestartet" });
  }

  async function sendAssessment() {
    if (!konsil || !user) return;
    if (!a.assessment.trim() || !a.recommendedDiagnosis.trim()) {
      toast({
        variant: "error",
        title: "Pflichtfelder fehlen",
        description: "Einschätzung und empfohlene Diagnose sind erforderlich.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await konsilService.submitAssessment(
        konsil.id,
        { ...a, authoredAt: new Date().toISOString(), authoredBy: user.name },
        user.id
      );
      localStorage.removeItem(STORAGE_PREFIX + konsil.id);
      toast({ variant: "success", title: "Befund übermittelt" });
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function sendRueckfrage() {
    if (!konsil || !user || !rueckfrageText.trim()) return;
    await konsilService.askRueckfrage(konsil.id, rueckfrageText.trim(), {
      role: "dermatologist",
      name: user.name,
    });
    setRueckfrageText("");
    setRueckfrageOpen(false);
    await refresh();
    toast({ variant: "success", title: "Rückfrage gesendet" });
  }

  async function closeKonsil() {
    if (!konsil || !user) return;
    await konsilService.updateStatus(konsil.id, "closed", user.name);
    await refresh();
    toast({ variant: "success", title: "Konsil geschlossen" });
  }

  const canEditAssessment = konsil.status !== "closed";

  return (
    <>
      <PageHeader
        title={konsil.id}
        description={konsil.reason}
        breadcrumbs={
          <Link to="/expert/konsile" className="hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Eingehende Konsile
          </Link>
        }
        action={
          <>
            {konsil.status === "submitted" && (
              <Button variant="outline" onClick={startReview}>
                <Eye className="w-4 h-4" /> Begutachtung starten
              </Button>
            )}
            <Button variant="outline" onClick={() => setRequestOpen(true)}>
              <FilePlus2 className="w-4 h-4" /> Daten anfordern
            </Button>
            <Button variant="outline" onClick={() => setRueckfrageOpen(true)} disabled={!canEditAssessment}>
              <HelpCircle className="w-4 h-4" /> Rückfrage
            </Button>
            {konsil.status !== "closed" && (
              <Button variant="outline" onClick={closeKonsil}>
                <Lock className="w-4 h-4" /> Schließen
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
                  <span>Anfrage</span>
                  <StatusBadge status={konsil.status} size="sm" />
                  <UrgencyBadge urgency={konsil.urgency} size="sm" />
                </div>
              }
              description={`Eingegangen ${formatDateTime(konsil.createdAt)}`}
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
            <CardHeader title="Körperregionen" />
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

          <KonsilUploadsCard uploads={uploads} needsReview={needsReview} />

          <Card>
            <CardHeader
              title="Befund / Einschätzung"
              description="Strukturierte Beurteilung und Therapieempfehlung"
            />
            <CardBody className="space-y-4">
              <Field label="Einschätzung" required>
                <Textarea
                  rows={4}
                  value={a.assessment}
                  onChange={(e) => update("assessment", e.target.value)}
                  disabled={!canEditAssessment}
                  placeholder="Klinische Einschätzung des dargestellten Befundes…"
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Empfohlene Diagnose" required>
                  <Input
                    value={a.recommendedDiagnosis}
                    onChange={(e) => update("recommendedDiagnosis", e.target.value)}
                    disabled={!canEditAssessment}
                    placeholder="z. B. Psoriasis vulgaris (L40.0)"
                  />
                </Field>
                <Field label="Differentialdiagnosen" hint="Mehrere mit Komma trennen">
                  <Input
                    value={a.differentialDiagnoses.join(", ")}
                    onChange={(e) =>
                      update(
                        "differentialDiagnoses",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    disabled={!canEditAssessment}
                  />
                </Field>
              </div>
              <Field label="Therapieempfehlung">
                <Textarea
                  rows={3}
                  value={a.recommendedTreatment}
                  onChange={(e) => update("recommendedTreatment", e.target.value)}
                  disabled={!canEditAssessment}
                />
              </Field>
              <Field label="Nächste Schritte">
                <Textarea
                  rows={2}
                  value={a.nextSteps}
                  onChange={(e) => update("nextSteps", e.target.value)}
                  disabled={!canEditAssessment}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Dringlichkeitsempfehlung">
                  <Select
                    value={a.urgencyRecommendation}
                    onChange={(e) => update("urgencyRecommendation", e.target.value as Urgency)}
                    disabled={!canEditAssessment}
                  >
                    <option value="routine">Routine</option>
                    <option value="soon">Zeitnah</option>
                    <option value="urgent">Dringend</option>
                  </Select>
                </Field>
                <Field label="In-Person-Termin empfohlen?">
                  <div className="flex gap-4 h-10 items-center">
                    {[
                      { l: "Ja", v: true },
                      { l: "Nein", v: false },
                    ].map((o) => (
                      <label key={o.l} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={a.inPersonAppointmentRecommended === o.v}
                          onChange={() => update("inPersonAppointmentRecommended", o.v)}
                          disabled={!canEditAssessment}
                        />
                        {o.l}
                      </label>
                    ))}
                  </div>
                </Field>
              </div>

              {canEditAssessment && (
                <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
                  <Button variant="outline" onClick={saveDraft}>
                    <Save className="w-4 h-4" /> Entwurf speichern
                  </Button>
                  <Button onClick={sendAssessment} loading={submitting}>
                    <Send className="w-4 h-4" /> Befund senden
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

        </div>

        <div className="space-y-6">
          {patient && <PatientSummaryCard patient={patient} />}
          <Card>
            <CardHeader title="Interne Notizen" description="Nur für Sie sichtbar" />
            <CardBody>
              <Textarea
                rows={5}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Persönliche Notizen zu diesem Konsil…"
              />
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
            description={"Thread mit der Hausarztpraxis"}
            reply={rueckfrageText}
            setReply={setRueckfrageText}
            sending={false}
            onSend={sendRueckfrage}
            closed={konsil.status === "closed"}
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

      <Modal
        open={rueckfrageOpen}
        onClose={() => setRueckfrageOpen(false)}
        title="Rückfrage an Hausarzt"
        description="Fordern Sie zusätzliche Informationen oder Bilder an."
        footer={
          <>
            <Button variant="outline" onClick={() => setRueckfrageOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={sendRueckfrage} disabled={!rueckfrageText.trim()}>
              <Send className="w-4 h-4" /> Senden
            </Button>
          </>
        }
      >
        <Textarea
          rows={4}
          value={rueckfrageText}
          onChange={(e) => setRueckfrageText(e.target.value)}
          placeholder="z. B. Bitte zusätzlich Laborwerte (Leberwerte) mitteilen…"
        />
      </Modal>
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
