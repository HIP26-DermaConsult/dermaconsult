import { Link } from "react-router-dom";
import { Calendar, Phone, Mail, MapPin, ShieldCheck, ExternalLink } from "lucide-react";
import type { Patient } from "@/types/patient";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ageFromDob, formatDate } from "@/utils/formatters";
import { Avatar } from "@/components/ui/Avatar";

export function PatientSummaryCard({ patient, compact = false }: { patient: Patient; compact?: boolean }) {
  const fullName = `${patient.firstName} ${patient.lastName}`;
  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            <Avatar name={fullName} color="bg-ink-700" />
            <div>
              <div className="font-semibold">{patient.lastName}, {patient.firstName}</div>
              <div className="text-xs text-ink-500">
                {patient.gender} · {ageFromDob(patient.dateOfBirth)} Jahre · geb. {formatDate(patient.dateOfBirth)}
              </div>
            </div>
          </div>
        }
        action={
          <Link
            to={`/patients/${patient.id}`}
            className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
          >
            Profil <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }
      />
      <CardBody className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <InfoRow icon={<ShieldCheck className="w-4 h-4 text-ink-400" />} label="Versicherung">
            {patient.insuranceType}
          </InfoRow>
          {patient.phone && (
            <InfoRow icon={<Phone className="w-4 h-4 text-ink-400" />} label="Telefon">{patient.phone}</InfoRow>
          )}
          {patient.email && (
            <InfoRow icon={<Mail className="w-4 h-4 text-ink-400" />} label="E-Mail">{patient.email}</InfoRow>
          )}
          {patient.address && (
            <InfoRow icon={<MapPin className="w-4 h-4 text-ink-400" />} label="Adresse">{patient.address}</InfoRow>
          )}
          <InfoRow icon={<Calendar className="w-4 h-4 text-ink-400" />} label="Geburtsdatum">
            {formatDate(patient.dateOfBirth)}
          </InfoRow>
        </div>
        {!compact && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-ink-100">
            <ListBlock title="Diagnosen" items={patient.diagnoses} />
            <ListBlock title="Allergien" items={patient.allergies} />
            <ListBlock title="Medikation" items={patient.medications} />
            <ListBlock title="Haut-Vorgeschichte" items={patient.skinHistory} />
          </div>
        )}
        {patient.notes && (
          <div className="text-sm text-ink-700 bg-ink-50 border border-ink-100 rounded-md p-3">
            <div className="font-medium text-ink-800 mb-0.5">Hinweis</div>
            {patient.notes}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-ink-500">{label}</div>
        <div className="text-ink-800 break-words">{children}</div>
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs text-ink-500 mb-1">{title}</div>
      {items.length === 0 ? (
        <div className="text-sm text-ink-400">—</div>
      ) : (
        <ul className="text-sm text-ink-800 space-y-0.5 list-disc list-inside">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
