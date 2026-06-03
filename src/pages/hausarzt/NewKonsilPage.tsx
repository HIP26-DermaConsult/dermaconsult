import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Send, CheckCircle2, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";
import { useToast } from "@/hooks/useToast";
import { konsilService } from "@/services/konsilService";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { PatientSelector } from "@/components/patients/PatientSelector";
import { PatientSummaryCard } from "@/components/patients/PatientSummaryCard";
import { NewPatientModal } from "@/components/patients/NewPatientModal";
import type { Patient } from "@/types/patient";
import { BodyRegionSelector } from "@/components/konsile/BodyRegionSelector";
import { ImageUploadArea } from "@/components/upload/ImageUploadArea";
import { UrgencyBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import type { BodyRegionId, ImageAttachment, Urgency } from "@/types/konsil";
import { BODY_REGION_LABELS } from "@/utils/constants";
import { cn } from "@/utils/formatters";

type Step = 0 | 1 | 2 | 3 | 4;
const STEPS = [
  { label: "Patient", desc: "Patient auswählen" },
  { label: "Anamnese", desc: "Klinische Angaben" },
  { label: "Körperregionen", desc: "Lokalisation" },
  { label: "Bilder", desc: "Foto-Dokumentation" },
  { label: "Übersicht", desc: "Prüfen & senden" },
] as const;

export default function NewKonsilPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, refresh: refreshPatients, setPatients } = usePatients();
  const { toast } = useToast();
  const [newPatientOpen, setNewPatientOpen] = useState(false);

  const [step, setStep] = useState<Step>(0);
  const [patientId, setPatientId] = useState<string | undefined>();
  const [urgency, setUrgency] = useState<Urgency>("routine");
  const [reason, setReason] = useState("");
  const [clinicalDescription, setClinicalDescription] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [suspectedDiagnosis, setSuspectedDiagnosis] = useState("");
  const [previousTreatments, setPreviousTreatments] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [regions, setRegions] = useState<BodyRegionId[]>([]);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const patient = useMemo(() => patients.find((p) => p.id === patientId), [patientId, patients]);

  const stepValid: Record<Step, boolean> = {
    0: !!patientId,
    1: reason.trim().length > 4 && clinicalDescription.trim().length > 4 && symptomDuration.trim().length > 0,
    2: regions.length > 0,
    3: true,
    4: true,
  };

  function next() {
    if (step < 4 && stepValid[step]) setStep((step + 1) as Step);
  }
  function back() {
    if (step > 0) setStep((step - 1) as Step);
  }

  async function submit() {
    if (!user || !patientId) return;
    setSubmitting(true);
    try {
      const konsil = await konsilService.create(
        {
          patientId,
          urgency,
          reason,
          clinicalDescription,
          symptomDuration,
          suspectedDiagnosis: suspectedDiagnosis || undefined,
          previousTreatments: previousTreatments || undefined,
          additionalInfo: additionalInfo || undefined,
          selectedBodyRegions: regions,
          images,
        },
        user.id,
        user.name
      );
      toast({ variant: "success", title: "Konsil gesendet", description: `${konsil.id} wurde an die Dermatologie übermittelt.` });
      navigate(`/konsile/${konsil.id}`);
    } catch (e) {
      toast({ variant: "error", title: "Senden fehlgeschlagen", description: "Bitte erneut versuchen." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Neues Konsil erstellen"
        description="Erfassen Sie strukturiert die Anamnese, betroffene Regionen und Bilder."
      />

      <Stepper step={step} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 0 && (
            <Card>
              <CardHeader
                title="Patient auswählen"
                description="Suchen Sie aus Ihren bestehenden Patienten — oder legen Sie neue an."
                action={
                  <Button variant="outline" size="sm" onClick={() => setNewPatientOpen(true)}>
                    <UserPlus className="w-4 h-4" /> Neue:r Patient:in
                  </Button>
                }
              />
              <CardBody>
                <PatientSelector patients={patients} value={patientId} onChange={setPatientId} />
                <div className="mt-3 text-xs text-ink-500">
                  Patient:in noch nicht in der Kartei?{" "}
                  <button
                    type="button"
                    className="text-brand-700 hover:underline font-medium"
                    onClick={() => setNewPatientOpen(true)}
                  >
                    Jetzt anlegen
                  </button>{" "}
                  — die Person wird direkt für dieses Konsil ausgewählt.
                </div>
              </CardBody>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardHeader title="Klinische Angaben" description="Fragestellung, Anamnese und Befund." />
              <CardBody className="space-y-4">
                <Field label="Fragestellung an die Dermatologie" required>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="z. B. Einschätzung Handekzem, Therapieempfehlung"
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Symptomdauer" required>
                    <Input
                      value={symptomDuration}
                      onChange={(e) => setSymptomDuration(e.target.value)}
                      placeholder="z. B. 6 Wochen"
                    />
                  </Field>
                  <Field label="Dringlichkeit" required>
                    <Select value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)}>
                      <option value="routine">Routine</option>
                      <option value="soon">Zeitnah</option>
                      <option value="urgent">Dringend</option>
                    </Select>
                  </Field>
                </div>
                <Field label="Anamnese / Befund" required hint="Verlauf, klinisches Bild, relevante Begleitsymptome.">
                  <Textarea
                    rows={5}
                    value={clinicalDescription}
                    onChange={(e) => setClinicalDescription(e.target.value)}
                    placeholder="Beschreiben Sie die klinische Situation…"
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Verdachtsdiagnose">
                    <Input
                      value={suspectedDiagnosis}
                      onChange={(e) => setSuspectedDiagnosis(e.target.value)}
                      placeholder="z. B. Kontaktekzem"
                    />
                  </Field>
                  <Field label="Bisherige Therapie">
                    <Input
                      value={previousTreatments}
                      onChange={(e) => setPreviousTreatments(e.target.value)}
                      placeholder="z. B. Mometason 0,1% 2 Wochen"
                    />
                  </Field>
                </div>
                <Field label="Zusätzliche Informationen">
                  <Textarea
                    rows={3}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Beruf, Allergien, weitere Hinweise…"
                  />
                </Field>
              </CardBody>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader
                title="Betroffene Körperregionen"
                description="Markieren Sie alle betroffenen Areale (Vorder- und Rückansicht)."
              />
              <CardBody>
                <BodyRegionSelector value={regions} onChange={setRegions} />
              </CardBody>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader
                title="Bilder anhängen"
                description="Foto-Dokumentation per Desktop oder Smartphone."
              />
              <CardBody>
                <ImageUploadArea images={images} onChange={setImages} />
              </CardBody>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader title="Zusammenfassung" description="Bitte prüfen Sie alle Angaben vor dem Senden." />
              <CardBody className="space-y-5">
                <Summary label="Patient">
                  {patient ? `${patient.lastName}, ${patient.firstName}` : "—"}
                </Summary>
                <Summary label="Dringlichkeit">
                  <UrgencyBadge urgency={urgency} />
                </Summary>
                <Summary label="Fragestellung">{reason || "—"}</Summary>
                <Summary label="Symptomdauer">{symptomDuration || "—"}</Summary>
                <Summary label="Anamnese / Befund">
                  <p className="whitespace-pre-wrap">{clinicalDescription || "—"}</p>
                </Summary>
                {suspectedDiagnosis && <Summary label="Verdachtsdiagnose">{suspectedDiagnosis}</Summary>}
                {previousTreatments && <Summary label="Bisherige Therapie">{previousTreatments}</Summary>}
                {additionalInfo && <Summary label="Weitere Hinweise">{additionalInfo}</Summary>}
                <Summary label="Körperregionen">
                  {regions.length === 0 ? (
                    "—"
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {regions.map((r) => (
                        <Badge key={r} className="bg-brand-50 text-brand-700 ring-brand-200">
                          {BODY_REGION_LABELS[r]}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Summary>
                <Summary label="Bilder">
                  {images.length === 0 ? "Keine Bilder angehängt" : `${images.length} Datei(en)`}
                </Summary>
              </CardBody>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4" /> Zurück
            </Button>
            {step < 4 ? (
              <Button onClick={next} disabled={!stepValid[step]}>
                Weiter <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={submit} loading={submitting}>
                <Send className="w-4 h-4" /> Konsil absenden
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {patient ? (
            <PatientSummaryCard patient={patient} compact={step !== 4} />
          ) : (
            <Card>
              <CardBody className="text-sm text-ink-500 text-center py-10">
                Patient noch nicht ausgewählt.
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Checkliste" />
            <CardBody className="space-y-2 text-sm">
              <Check ok={!!patientId} label="Patient ausgewählt" />
              <Check ok={stepValid[1]} label="Klinische Angaben vollständig" />
              <Check ok={regions.length > 0} label="Körperregionen markiert" />
              <Check ok={images.length > 0} label="Mindestens ein Bild empfohlen" optional />
            </CardBody>
          </Card>
        </div>
      </div>

      <NewPatientModal
        open={newPatientOpen}
        onClose={() => setNewPatientOpen(false)}
        onCreated={(p: Patient) => {
          // Optimistically insert without waiting for a re-fetch so the
          // new patient is immediately visible and selectable.
          setPatients((prev) => [p, ...prev]);
          setPatientId(p.id);
          refreshPatients();
        }}
      />
    </>
  );
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={s.label} className="flex items-center gap-2 shrink-0">
            <div
              className={cn(
                "w-7 h-7 rounded-full grid place-items-center text-xs font-semibold border",
                done && "bg-brand-600 text-white border-brand-600",
                active && "bg-white text-brand-700 border-brand-500 ring-4 ring-brand-100",
                !done && !active && "bg-white text-ink-500 border-ink-200"
              )}
            >
              {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <div className="hidden sm:block">
              <div className={cn("text-sm font-medium", active ? "text-ink-900" : "text-ink-600")}>
                {s.label}
              </div>
              <div className="text-xs text-ink-500">{s.desc}</div>
            </div>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-ink-200 mx-2" />}
          </li>
        );
      })}
    </ol>
  );
}

function Summary({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 text-sm">
      <div className="text-ink-500">{label}</div>
      <div className="text-ink-900">{children}</div>
    </div>
  );
}

function Check({ ok, label, optional }: { ok: boolean; label: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold",
          ok ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500"
        )}
      >
        {ok ? "✓" : ""}
      </span>
      <span className={cn(ok ? "text-ink-900" : "text-ink-600")}>
        {label}
        {optional && <span className="text-ink-400 ml-1">(optional)</span>}
      </span>
    </div>
  );
}
