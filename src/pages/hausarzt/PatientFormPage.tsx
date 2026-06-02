import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import type { Gender, InsuranceType, Patient } from "@/types/patient";
import { patientService } from "@/services/patientService";
import { useToast } from "@/hooks/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const empty: Omit<Patient, "id"> = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "weiblich",
  insuranceType: "gesetzlich",
  phone: "",
  email: "",
  address: "",
  allergies: [],
  medications: [],
  diagnoses: [],
  skinHistory: [],
  notes: "",
};

export default function PatientFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<Omit<Patient, "id">>(empty);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === "edit" && id) {
      patientService.get(id).then((p) => {
        if (p) {
          const { id: _, ...rest } = p;
          setForm(rest);
        }
        setLoading(false);
      });
    }
  }, [mode, id]);

  function update<K extends keyof Omit<Patient, "id">>(key: K, value: Omit<Patient, "id">[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function listFromText(text: string): string[] {
    return text.split(",").map((s) => s.trim()).filter(Boolean);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.dateOfBirth) {
      toast({ variant: "error", title: "Pflichtfelder fehlen", description: "Name und Geburtsdatum sind erforderlich." });
      return;
    }
    setSaving(true);
    try {
      if (mode === "create") {
        const p = await patientService.create(form);
        toast({ variant: "success", title: "Patient:in angelegt" });
        navigate(`/patients/${p.id}`);
      } else if (id) {
        await patientService.update(id, form);
        toast({ variant: "success", title: "Änderungen gespeichert" });
        navigate(`/patients/${id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Card><CardBody>Lade…</CardBody></Card>;

  return (
    <>
      <PageHeader
        title={mode === "create" ? "Neue:r Patient:in" : "Patient:in bearbeiten"}
        breadcrumbs={
          <Link to="/patients" className="hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Patienten
          </Link>
        }
      />
      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Stammdaten" />
            <CardBody className="grid sm:grid-cols-2 gap-4">
              <Field label="Vorname" required>
                <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
              </Field>
              <Field label="Nachname" required>
                <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
              </Field>
              <Field label="Geburtsdatum" required>
                <Input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
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
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Kontakt" />
            <CardBody className="grid sm:grid-cols-2 gap-4">
              <Field label="Telefon">
                <Input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
              </Field>
              <Field label="E-Mail">
                <Input type="email" value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} />
              </Field>
              <Field label="Adresse" hint="Straße, PLZ, Ort">
                <Input value={form.address ?? ""} onChange={(e) => update("address", e.target.value)} />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Medizinische Daten" description="Mehrere Einträge mit Komma trennen." />
            <CardBody className="space-y-4">
              <Field label="Diagnosen">
                <Input
                  value={form.diagnoses.join(", ")}
                  onChange={(e) => update("diagnoses", listFromText(e.target.value))}
                  placeholder="z. B. Arterielle Hypertonie, Diabetes Typ 2"
                />
              </Field>
              <Field label="Allergien">
                <Input
                  value={form.allergies.join(", ")}
                  onChange={(e) => update("allergies", listFromText(e.target.value))}
                />
              </Field>
              <Field label="Medikation">
                <Input
                  value={form.medications.join(", ")}
                  onChange={(e) => update("medications", listFromText(e.target.value))}
                />
              </Field>
              <Field label="Haut-Vorgeschichte">
                <Input
                  value={form.skinHistory.join(", ")}
                  onChange={(e) => update("skinHistory", listFromText(e.target.value))}
                />
              </Field>
              <Field label="Hinweise">
                <Textarea
                  rows={3}
                  value={form.notes ?? ""}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </Field>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader title="Aktion" />
            <CardBody className="space-y-2">
              <Button type="submit" className="w-full" loading={saving}>
                <Save className="w-4 h-4" /> Speichern
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate(-1)}
              >
                Abbrechen
              </Button>
            </CardBody>
          </Card>
        </div>
      </form>
    </>
  );
}
