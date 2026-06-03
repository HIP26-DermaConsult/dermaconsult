import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { patientSummaryService } from "@/services/patientSummaryService";
import type { Konsil } from "@/types/konsil";
import type { PatientSummary } from "@/types/portal";

export function SharePatientSummaryModal({
  open,
  onClose,
  konsil,
  existing,
  onShared,
}: {
  open: boolean;
  onClose: () => void;
  konsil: Konsil;
  existing?: PatientSummary;
  onShared?: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [diseaseInfo, setDiseaseInfo] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [doctorNote, setDoctorNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Seed the form when opening: prefer an existing shared summary, otherwise
  // prefill from the expert assessment so the doctor only has to simplify it.
  useEffect(() => {
    if (!open) return;
    if (existing) {
      setDiseaseInfo(existing.diseaseInfo);
      setTreatmentPlan(existing.treatmentPlan);
      setDoctorNote(existing.doctorNote);
    } else {
      const a = konsil.expertAssessment;
      setDiseaseInfo(a?.recommendedDiagnosis ?? "");
      setTreatmentPlan(a?.recommendedTreatment ?? "");
      setDoctorNote(a?.nextSteps ?? "");
    }
  }, [open, existing, konsil]);

  async function save() {
    if (!user) return;
    if (!diseaseInfo.trim() || !treatmentPlan.trim()) {
      toast({
        variant: "error",
        title: "Pflichtfelder fehlen",
        description: "Erkrankungsinfo und Behandlungsplan sind erforderlich.",
      });
      return;
    }
    setSaving(true);
    try {
      await patientSummaryService.upsert({
        konsilId: konsil.id,
        patientId: konsil.patientId,
        diseaseInfo: diseaseInfo.trim(),
        treatmentPlan: treatmentPlan.trim(),
        doctorNote: doctorNote.trim(),
        sharedByName: user.name,
        ...(existing ? { sharedAt: existing.sharedAt } : {}),
      });
      toast({ variant: "success", title: "Für Patient:in freigegeben" });
      onShared?.();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Freigabe bearbeiten" : "Für Patient:in freigeben"}
      description="Diese Texte sieht die Patientin / der Patient im Portal — bitte in verständlicher Sprache formulieren."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={save} loading={saving}>
            <Send className="w-4 h-4" /> {existing ? "Aktualisieren" : "Freigeben"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label="Ihre Diagnose / Erkrankung"
          required
          hint="Was hat die Patientin / der Patient — laienverständlich erklärt"
        >
          <Textarea
            rows={3}
            value={diseaseInfo}
            onChange={(e) => setDiseaseInfo(e.target.value)}
            placeholder="z. B. Es besteht der Verdacht auf ein Kontaktekzem…"
          />
        </Field>
        <Field label="Behandlungsplan" required hint="Konkrete Schritte für die Patientin / den Patienten">
          <Textarea
            rows={4}
            value={treatmentPlan}
            onChange={(e) => setTreatmentPlan(e.target.value)}
            placeholder="z. B. 1. Creme 2x täglich anwenden…"
          />
        </Field>
        <Field label="Hinweise (optional)">
          <Textarea
            rows={2}
            value={doctorNote}
            onChange={(e) => setDoctorNote(e.target.value)}
            placeholder="z. B. Bitte melden bei Verschlechterung…"
          />
        </Field>
      </div>
    </Modal>
  );
}
