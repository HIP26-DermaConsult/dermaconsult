import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { patientService } from "@/services/patientService";
import { useToast } from "@/hooks/useToast";
import type { Gender, InsuranceType, Patient } from "@/types/patient";

const emptyForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "weiblich" as Gender,
  insuranceType: "gesetzlich" as InsuranceType,
  phone: "",
  email: "",
  allergies: "",
  medications: "",
  diagnoses: "",
};

export function NewPatientModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (patient: Patient) => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function reset() {
    setForm(emptyForm);
  }

  function listFromText(text: string): string[] {
    return text.split(",").map((s) => s.trim()).filter(Boolean);
  }

  async function submit() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.dateOfBirth) {
      toast({
        variant: "error",
        title: "Pflichtfelder fehlen",
        description: "Vorname, Nachname und Geburtsdatum sind erforderlich.",
      });
      return;
    }
    setSaving(true);
    try {
      const patient = await patientService.create({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        insuranceType: form.insuranceType,
        phone: form.phone || undefined,
        email: form.email || undefined,
        allergies: listFromText(form.allergies),
        medications: listFromText(form.medications),
        diagnoses: listFromText(form.diagnoses),
        skinHistory: [],
      });
      toast({ variant: "success", title: "Patient:in angelegt", description: `${patient.firstName} ${patient.lastName} hinzugefügt.` });
      onCreated(patient);
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      size="lg"
      title="Neue:n Patient:in anlegen"
      description="Erfassen Sie die wichtigsten Stammdaten. Weitere Details lassen sich später im Patientenprofil ergänzen."
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={saving}
          >
            Abbrechen
          </Button>
          <Button onClick={submit} loading={saving}>
            <UserPlus className="w-4 h-4" /> Anlegen und auswählen
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Vorname" required>
            <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
          </Field>
          <Field label="Nachname" required>
            <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </Field>
          <Field label="Geburtsdatum" required>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
            />
          </Field>
          <Field label="Geschlecht" required>
            <Select value={form.gender} onChange={(e) => update("gender", e.target.value as Gender)}>
              <option value="weiblich">weiblich</option>
              <option value="männlich">männlich</option>
              <option value="divers">divers</option>
            </Select>
          </Field>
          <Field label="Versicherung" required>
            <Select
              value={form.insuranceType}
              onChange={(e) => update("insuranceType", e.target.value as InsuranceType)}
            >
              <option value="gesetzlich">gesetzlich</option>
              <option value="privat">privat</option>
              <option value="selbstzahler">selbstzahler</option>
            </Select>
          </Field>
          <Field label="Telefon">
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <Field label="E-Mail">
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-ink-100">
          <Field label="Diagnosen" hint="Komma-getrennt">
            <Input value={form.diagnoses} onChange={(e) => update("diagnoses", e.target.value)} />
          </Field>
          <Field label="Allergien" hint="Komma-getrennt">
            <Input value={form.allergies} onChange={(e) => update("allergies", e.target.value)} />
          </Field>
          <Field label="Medikation" hint="Komma-getrennt">
            <Input value={form.medications} onChange={(e) => update("medications", e.target.value)} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
