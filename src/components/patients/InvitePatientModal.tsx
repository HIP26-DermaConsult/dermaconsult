import { useEffect, useState } from "react";
import { Mail, Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CopyableLink } from "@/components/ui/CopyableLink";
import { useAuth } from "@/hooks/useAuth";
import { inviteService } from "@/services/inviteService";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types/patient";

export function InvitePatientModal({
  open,
  onClose,
  patient,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  patient: Patient;
  onInvited?: () => void;
}) {
  const { user } = useAuth();
  const [link, setLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) {
      setLink(null);
      setCreating(false);
    }
  }, [open]);

  async function generate() {
    if (!user) return;
    setCreating(true);
    try {
      const invite = await inviteService.create(patient.id, { id: user.id, name: user.name });
      if (patient.portalStatus !== "active") {
        await patientService.setPortalStatus(patient.id, "invited");
      }
      setLink(`${window.location.origin}/invite/${invite.token}`);
      onInvited?.();
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Portal-Zugang einladen"
      description={`Erstellen Sie einen Einladungslink für ${patient.firstName} ${patient.lastName}.`}
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          Schließen
        </Button>
      }
    >
      {!link ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-sm text-ink-700">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 grid place-items-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <p>
              Über den Link kann sich die Patientin / der Patient registrieren und erhält Zugriff auf
              freigegebene Behandlungszusammenfassungen. Der Link ist 7 Tage gültig.
            </p>
          </div>
          <Button onClick={generate} loading={creating}>
            <Send className="w-4 h-4" /> Einladungslink erstellen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink-700">
            Teilen Sie diesen Link sicher mit der Patientin / dem Patienten:
          </p>
          <CopyableLink url={link} />
          <p className="text-xs text-ink-500">
            Zur Bestätigung der Identität wird bei der Registrierung das Geburtsdatum abgefragt.
          </p>
        </div>
      )}
    </Modal>
  );
}
