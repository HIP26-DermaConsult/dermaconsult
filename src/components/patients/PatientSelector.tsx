import { useState, useMemo } from "react";
import { Search, Check, User } from "lucide-react";
import type { Patient } from "@/types/patient";
import { cn, ageFromDob, formatDate } from "@/utils/formatters";

export function PatientSelector({
  patients,
  value,
  onChange,
}: {
  patients: Patient[];
  value?: string;
  onChange: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return patients;
    return patients.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(t) ||
      p.dateOfBirth.includes(t)
    );
  }, [patients, q]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Patient suchen (Name oder Geburtsdatum)…"
          className="w-full h-10 pl-9 pr-3 rounded-md border border-ink-200 bg-white text-sm focus-ring focus:border-brand-500"
        />
      </div>
      <div className="max-h-72 overflow-y-auto border border-ink-200 rounded-md divide-y divide-ink-100">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-sm text-ink-500 text-center">Keine Patienten gefunden.</div>
        ) : (
          filtered.map((p) => {
            const selected = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-ink-50 transition-colors",
                  selected && "bg-brand-50/60"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-ink-100 grid place-items-center text-ink-500">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink-900 text-sm">
                    {p.lastName}, {p.firstName}
                  </div>
                  <div className="text-xs text-ink-500">
                    {ageFromDob(p.dateOfBirth)} J. · geb. {formatDate(p.dateOfBirth)} · {p.insuranceType}
                  </div>
                </div>
                {selected && <Check className="w-4 h-4 text-brand-700" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
