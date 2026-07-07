import type { ReferralForm } from "@/types/konsil";
import { cn } from "@/utils/formatters";

type Props = {
  value: ReferralForm;
  onChange?: (next: ReferralForm) => void;
  readOnly?: boolean;
  missingFields?: string[];
};

const red = "text-[#d5222a]";
const inputClass =
  "w-full min-w-0 rounded-none border border-[#ef8c8f] bg-white/80 px-1 py-0.5 text-[10px] leading-tight text-ink-900 outline-none focus:ring-1 focus:ring-[#d5222a] disabled:bg-white/50 disabled:text-ink-800";

export function ReferralFormSheet({ value, onChange, readOnly = false, missingFields = [] }: Props) {
  function patch<K extends keyof ReferralForm>(key: K, next: ReferralForm[K]) {
    onChange?.({ ...value, [key]: next });
  }

  const disabled = readOnly || !onChange;

  return (
    <section className="w-full min-w-0">
      <div className="w-full min-w-0 border border-[#d6c875] bg-[#fff7bc] p-2 shadow-sm sm:p-3">
        <div className="relative min-w-0 border-2 border-black p-2 sm:p-3">
          <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(220px,0.95fr)_minmax(300px,1.35fr)_52px] lg:grid-cols-[minmax(230px,0.95fr)_minmax(320px,1.35fr)_58px]">
            <div className="space-y-2">
              <TextInput
                label="Kostenträger bzw. Krankenkasse"
                value={value.insuranceName}
                onChange={(v) => patch("insuranceName", v)}
                disabled={disabled}
              />
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_82px] gap-2">
                <TextInput
                  label="Name, Vorname des Versicherten"
                  value={value.patientDisplay}
                  onChange={(v) => patch("patientDisplay", v)}
                  disabled={disabled}
                  required
                  invalid={missingFields.includes("Patient")}
                />
                <TextInput label="geb. am" value={value.patientDateOfBirth} onChange={(v) => patch("patientDateOfBirth", v)} disabled={disabled} required invalid={missingFields.includes("Geburtsdatum")} />
              </div>
              <div className="grid min-w-0 grid-cols-3 gap-1.5">
                <TextInput label="Kassen-Nr." value={value.insuranceFundNumber} onChange={(v) => patch("insuranceFundNumber", v)} disabled={disabled} />
                <TextInput label="Versicherten-Nr." value={value.insuranceNumber} onChange={(v) => patch("insuranceNumber", v)} disabled={disabled} />
                <TextInput label="Status" value={value.insuranceStatus} onChange={(v) => patch("insuranceStatus", v)} disabled={disabled} />
              </div>
              <div className="grid min-w-0 grid-cols-3 gap-1.5">
                <TextInput label="Betriebsstätten-Nr." value={value.bsnr} onChange={(v) => patch("bsnr", v)} disabled={disabled} />
                <TextInput label="Arzt-Nr." value={value.lanr} onChange={(v) => patch("lanr", v)} disabled={disabled} />
                <TextInput label="Datum" value={value.issueDate} onChange={(v) => patch("issueDate", v)} disabled={disabled} required invalid={missingFields.includes("Datum")} />
              </div>
            </div>

            <div className="min-w-0">
              <div className={cn("text-lg font-bold leading-none", red)}>Überweisungsschein</div>
              <div className="mt-2 grid min-w-0 grid-cols-2 gap-x-2 gap-y-1.5 lg:grid-cols-3">
                <Check label="Kurativ" checked={value.kurativ} onChange={(v) => patch("kurativ", v)} disabled={disabled} required invalid={missingFields.includes("Kurativ oder Präventiv")} />
                <Check label="Präventiv" checked={value.praeventiv} onChange={(v) => patch("praeventiv", v)} disabled={disabled} required invalid={missingFields.includes("Kurativ oder Präventiv")} />
                <Check label="bei belegärztl. Behandlung" checked={value.inpatientTreatment} onChange={(v) => patch("inpatientTreatment", v)} disabled={disabled} />
                <Check label="Unfall" checked={value.accident} onChange={(v) => patch("accident", v)} disabled={disabled} />
                <Check label="Unfallfolgen" checked={value.accidentConsequences} onChange={(v) => patch("accidentConsequences", v)} disabled={disabled} />
                <Check label="sonstiger Kostenträger" checked={value.otherPayer} onChange={(v) => patch("otherPayer", v)} disabled={disabled} />
              </div>
              <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_105px] items-end gap-2">
                <TextInput label="Überweisung an" value={value.referralTo} onChange={(v) => patch("referralTo", v)} disabled={disabled} required invalid={missingFields.includes("Überweisung an")} />
                <TextInput label="AU bis" value={value.auUntil} onChange={(v) => patch("auUntil", v)} disabled={disabled} />
              </div>
              <div className="mt-2 grid min-w-0 grid-cols-2 gap-x-2 gap-y-1.5">
                <Check label="Ausführung von Auftragsleistungen" checked={value.orderService} onChange={(v) => patch("orderService", v)} disabled={disabled} required invalid={missingFields.includes("Art der Überweisung")} />
                <Check label="Konsiliaruntersuchung" checked={value.consultantExamination} onChange={(v) => patch("consultantExamination", v)} disabled={disabled} required invalid={missingFields.includes("Art der Überweisung")} />
                <Check label="Mit-/Weiterbehandlung" checked={value.coTreatment} onChange={(v) => patch("coTreatment", v)} disabled={disabled} required invalid={missingFields.includes("Art der Überweisung")} />
                <Check label="Weiterbehandlung" checked={value.furtherTreatment} onChange={(v) => patch("furtherTreatment", v)} disabled={disabled} required invalid={missingFields.includes("Art der Überweisung")} />
              </div>
              <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_105px] items-end gap-2">
                <Check label="eingeschränkter Leistungsanspruch gemäß § 16 Abs. 3a SGB V" checked={value.limitedEntitlement} onChange={(v) => patch("limitedEntitlement", v)} disabled={disabled} />
                <TextInput label="OP am" value={value.surgeryDate} onChange={(v) => patch("surgeryDate", v)} disabled={disabled} />
              </div>
              <div className="mt-1">
                <Check label="ASV" checked={value.asv} onChange={(v) => patch("asv", v)} disabled={disabled} />
              </div>
            </div>

            <div className={cn("hidden text-right text-[10px] font-bold md:block", red)}>
              <div>06</div>
              <div>Quartal</div>
              <div className="mt-8">Geschlecht</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <LineArea
              label="Diagnose/Verdachtsdiagnose"
              value={value.diagnosis}
              onChange={(v) => patch("diagnosis", v)}
              disabled={disabled}
              rows={2}
              required
              invalid={missingFields.includes("Diagnose/Verdachtsdiagnose")}
            />
            <LineArea
              label="Befund/Medikation"
              value={value.findingsMedication}
              onChange={(v) => patch("findingsMedication", v)}
              disabled={disabled}
              rows={3}
            />
            <div className="grid min-w-0 grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_150px] lg:grid-cols-[minmax(0,1fr)_170px]">
              <LineArea
                label="Auftrag"
                value={value.order}
                onChange={(v) => patch("order", v)}
                disabled={disabled}
                rows={4}
                required
                invalid={missingFields.includes("Auftrag")}
              />
              <div className="space-y-1">
                <div className="h-20 border border-[#ef8c8f] bg-white/40 md:h-28" />
                <TextInput label="Vertragsarztstempel / Unterschrift des Arztes" value={value.signature} onChange={(v) => patch("signature", v)} disabled={disabled} />
              </div>
            </div>
          </div>
          <div className={cn("absolute bottom-1 right-3 text-[9px]", red)}>Muster 6 (BFB)</div>
        </div>
      </div>
    </section>
  );
}

function Label({ children, required, invalid }: { children: React.ReactNode; required?: boolean; invalid?: boolean }) {
  return (
    <label className={cn("block min-w-0 break-words text-[9px] font-semibold leading-tight sm:text-[10px]", invalid ? "text-rose-700" : red)}>
      {children}
      {required && <span className="ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  disabled,
  required,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Label required={required} invalid={invalid}>{label}</Label>
      <input className={cn(inputClass, invalid && "border-rose-600 bg-rose-50")} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
    </div>
  );
}

function LineArea({
  label,
  value,
  onChange,
  disabled,
  rows,
  required,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows: number;
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Label required={required} invalid={invalid}>{label}</Label>
      <textarea
        rows={rows}
        className={cn(inputClass, "resize-none whitespace-pre-wrap", invalid && "border-rose-600 bg-rose-50")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
  disabled,
  required,
  invalid,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <label className={cn("flex min-w-0 items-start gap-1 text-[9px] font-semibold leading-tight sm:text-[10px]", invalid ? "text-rose-700" : red)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={cn("mt-0.5 h-3.5 w-3.5 rounded-none border-[#ef8c8f] text-[#d5222a] focus:ring-[#d5222a]", invalid && "ring-1 ring-rose-600")}
      />
      <span className="min-w-0 break-words">
        {label}
        {required && <span className="ml-0.5">*</span>}
      </span>
    </label>
  );
}
