import type { Konsil, NewKonsilInput, ReferralForm } from "@/types/konsil";
import type { Patient } from "@/types/patient";
import type { User } from "@/types/auth";

type ReferralSource = Pick<
  NewKonsilInput,
  "reason" | "clinicalDescription" | "suspectedDiagnosis" | "previousTreatments"
>;

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function patientDisplay(patient?: Patient) {
  if (!patient) return "";
  return `${patient.lastName}, ${patient.firstName}`;
}

export function buildReferralFormDefaults({
  patient,
  user,
  source,
  existing,
}: {
  patient?: Patient;
  user?: User | null;
  source: ReferralSource;
  existing?: Partial<ReferralForm>;
}): ReferralForm {
  const findings = [source.clinicalDescription, source.previousTreatments && `Bisherige Therapie: ${source.previousTreatments}`]
    .filter(Boolean)
    .join("\n\n");

  return {
    referringPractice: existing?.referringPractice ?? user?.practiceName ?? user?.name ?? "",
    patientDisplay: existing?.patientDisplay ?? patientDisplay(patient),
    patientDateOfBirth: existing?.patientDateOfBirth ?? patient?.dateOfBirth ?? "",
    insuranceName: existing?.insuranceName ?? patient?.insuranceType ?? "",
    insuranceFundNumber: existing?.insuranceFundNumber ?? "",
    insuranceNumber: existing?.insuranceNumber ?? "",
    insuranceStatus: existing?.insuranceStatus ?? "",
    bsnr: existing?.bsnr ?? "",
    lanr: existing?.lanr ?? "",
    issueDate: existing?.issueDate ?? todayIsoDate(),
    kurativ: existing?.kurativ ?? true,
    praeventiv: existing?.praeventiv ?? false,
    otherPayer: existing?.otherPayer ?? false,
    accident: existing?.accident ?? false,
    accidentConsequences: existing?.accidentConsequences ?? false,
    limitedEntitlement: existing?.limitedEntitlement ?? false,
    asv: existing?.asv ?? false,
    inpatientTreatment: existing?.inpatientTreatment ?? false,
    referralTo: existing?.referralTo ?? "Dermatologie",
    orderService: existing?.orderService ?? false,
    consultantExamination: existing?.consultantExamination ?? true,
    coTreatment: existing?.coTreatment ?? false,
    furtherTreatment: existing?.furtherTreatment ?? false,
    auUntil: existing?.auUntil ?? "",
    surgeryDate: existing?.surgeryDate ?? "",
    diagnosis: existing?.diagnosis ?? source.suspectedDiagnosis ?? "",
    findingsMedication: existing?.findingsMedication ?? findings,
    order: existing?.order ?? source.reason,
    signature: existing?.signature ?? user?.name ?? "",
  };
}

export function referralFormFromKonsil(konsil: Konsil, patient?: Patient, user?: User | null): ReferralForm {
  return buildReferralFormDefaults({
    patient,
    user,
    source: {
      reason: konsil.reason,
      clinicalDescription: konsil.clinicalDescription,
      suspectedDiagnosis: konsil.suspectedDiagnosis,
      previousTreatments: konsil.previousTreatments,
    },
    existing: konsil.referralForm,
  });
}

export function validateReferralForm(form: ReferralForm): string[] {
  const missing: string[] = [];
  if (!form.patientDisplay.trim()) missing.push("Patient");
  if (!form.patientDateOfBirth.trim()) missing.push("Geburtsdatum");
  if (!form.issueDate.trim()) missing.push("Datum");
  if (!form.referralTo.trim()) missing.push("Überweisung an");
  if (!form.kurativ && !form.praeventiv) missing.push("Kurativ oder Präventiv");
  if (!form.orderService && !form.consultantExamination && !form.coTreatment && !form.furtherTreatment) {
    missing.push("Art der Überweisung");
  }
  if (!form.diagnosis.trim()) missing.push("Diagnose/Verdachtsdiagnose");
  if (!form.order.trim()) missing.push("Auftrag");
  return missing;
}
