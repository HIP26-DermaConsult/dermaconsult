import { Link } from "react-router-dom";
import type { Konsil } from "@/types/konsil";
import type { Patient } from "@/types/patient";
import { StatusBadge, UrgencyBadge } from "@/components/ui/StatusBadge";
import { formatDate, relativeTime } from "@/utils/formatters";
import { ChevronRight } from "lucide-react";

export function KonsilTable({
  konsile,
  patients,
  basePath,
  empty,
}: {
  konsile: Konsil[];
  patients: Patient[];
  basePath: string;
  empty?: React.ReactNode;
}) {
  if (konsile.length === 0 && empty) return <>{empty}</>;
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-ink-50 text-ink-600">
          <tr className="text-left">
            <Th>ID</Th>
            <Th>Patient</Th>
            <Th>Fragestellung</Th>
            <Th>Erstellt</Th>
            <Th>Dringlichkeit</Th>
            <Th>Status</Th>
            <Th>Aktualisiert</Th>
            <Th> </Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {konsile.map((k) => {
            const p = patients.find((p) => p.id === k.patientId);
            return (
              <tr key={k.id} className="hover:bg-ink-50/60 transition-colors">
                <Td>
                  <Link to={`${basePath}/${k.id}`} className="font-medium text-brand-700 hover:underline">
                    {k.id}
                  </Link>
                </Td>
                <Td>
                  {p ? (
                    <>
                      <div className="font-medium text-ink-900">
                        {p.lastName}, {p.firstName}
                      </div>
                      <div className="text-xs text-ink-500">geb. {formatDate(p.dateOfBirth)}</div>
                    </>
                  ) : (
                    <span className="text-ink-400">—</span>
                  )}
                </Td>
                <Td className="max-w-[280px]">
                  <div className="line-clamp-2 text-ink-700">{k.reason}</div>
                </Td>
                <Td>{formatDate(k.createdAt)}</Td>
                <Td>
                  <UrgencyBadge urgency={k.urgency} size="sm" />
                </Td>
                <Td>
                  <StatusBadge status={k.status} size="sm" />
                </Td>
                <Td className="text-ink-500">{relativeTime(k.updatedAt)}</Td>
                <Td>
                  <Link
                    to={`${basePath}/${k.id}`}
                    className="text-ink-400 hover:text-ink-700"
                    aria-label="Öffnen"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className ?? ""}`}>{children}</td>;
}
