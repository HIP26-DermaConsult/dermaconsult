import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
import { CopyableLink } from "@/components/ui/CopyableLink";
import { useAuth } from "@/hooks/useAuth";
import { dataRequestService } from "@/services/dataRequestService";
import { konsilService } from "@/services/konsilService";

export function RequestPatientDataModal({
  open,
  onClose,
  patientId,
  konsilId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  patientId: string;
  konsilId?: string;
  onCreated?: () => void;
}) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) {
      setMessage("");
      setLink(null);
      setCreating(false);
    }
  }, [open]);

  async function create() {
    if (!user || !message.trim()) return;
    setCreating(true);
    try {
      const req = await dataRequestService.create({
        patientId,
        konsilId,
        message: message.trim(),
        by: { id: user.id, name: user.name },
      });
      if (konsilId) {
        await konsilService.addTimelineEvent(konsilId, {
          type: "note",
          by: user.name,
          description: `Zusätzliche Daten von Patient:in angefordert: „${message.trim()}“`,
        });
      }
      setLink(`${window.location.origin}/upload/${req.token}`);
      onCreated?.();
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Zusätzliche Daten anfordern"
      description="Erstellen Sie einen temporären Upload-Link, über den die Patientin / der Patient Bilder und eine Anmerkung hochladen kann."
      size="md"
      footer={
        link ? (
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button onClick={create} loading={creating} disabled={!message.trim()}>
              <Send className="w-4 h-4" /> Link erstellen
            </Button>
          </>
        )
      }
    >
      {!link ? (
        <Field label="Was soll die Patientin / der Patient bereitstellen?" required>
          <Textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="z. B. Bitte laden Sie aktuelle Fotos der betroffenen Hautstelle bei Tageslicht hoch."
          />
        </Field>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink-700">
            Teilen Sie diesen Link mit der Patientin / dem Patienten. Hochgeladene Daten erscheinen
            anschließend hier am Konsil. Der Link ist 7 Tage gültig.
          </p>
          <CopyableLink url={link} />
        </div>
      )}
    </Modal>
  );
}
