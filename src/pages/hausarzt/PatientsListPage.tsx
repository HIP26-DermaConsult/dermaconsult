import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users, ChevronRight } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { ageFromDob, formatDate } from "@/utils/formatters";
import { Badge } from "@/components/ui/Badge";

export default function PatientsListPage() {
  const { patients, loading } = usePatients();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return patients;
    return patients.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(t)
    );
  }, [patients, q]);

  return (
    <>
      <PageHeader
        title="Patienten"
        description="Patientenakten Ihrer Praxis."
        action={
          <Link to="/patients/new">
            <Button>
              <Plus className="w-4 h-4" /> Neue:r Patient:in
            </Button>
          </Link>
        }
      />

      <Card className="mb-4">
        <CardBody>
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suche nach Name…"
              className="w-full h-10 pl-9 pr-3 rounded-md border border-ink-200 bg-white text-sm focus-ring focus:border-brand-500"
            />
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <Card>
          <CardBody className="text-sm text-ink-500">Lade Patienten…</CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-5 h-5" />}
          title="Keine Patienten gefunden"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/patients/${p.id}`}
              className="group"
            >
              <Card className="hover:shadow-elevated transition-shadow h-full">
                <CardBody className="flex items-start gap-3">
                  <Avatar name={`${p.firstName} ${p.lastName}`} color="bg-ink-700" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900">
                      {p.lastName}, {p.firstName}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      {ageFromDob(p.dateOfBirth)} J. · geb. {formatDate(p.dateOfBirth)}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge size="sm" className="bg-ink-100 text-ink-700 ring-ink-200">
                        {p.insuranceType}
                      </Badge>
                      {p.diagnoses.slice(0, 2).map((d) => (
                        <Badge key={d} size="sm" className="bg-brand-50 text-brand-700 ring-brand-200">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-400 group-hover:text-ink-700" />
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
