import { mockKonsile } from "@/data/mockKonsile";
import type {
  AiAssessment,
  ExpertAssessment,
  Konsil,
  KonsilStatus,
  Message,
  NewKonsilInput,
  TimelineEvent,
} from "@/types/konsil";
import { uid } from "@/utils/formatters";
import { ensureKonsilUploadToken, uploadTokenForKonsilId } from "@/utils/konsilUpload";

const STORAGE_KEY = "derma_consult_konsile";

function load(): Konsil[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return (JSON.parse(raw) as Konsil[]).map(ensureKonsilUploadToken);
  } catch {
    /* ignore */
  }
  return mockKonsile.map(ensureKonsilUploadToken);
}

function save(konsile: Konsil[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(konsile));
}

// Backend integration: replace with /api/konsile calls
export const konsilService = {
  async list(): Promise<Konsil[]> {
    await wait();
    return load();
  },
  async get(id: string): Promise<Konsil | undefined> {
    await wait();
    return load().find((k) => k.id === id);
  },
  async create(input: NewKonsilInput, createdByUserId: string, createdByName: string): Promise<Konsil> {
    await wait();
    const id = `K-${new Date().getFullYear()}-${String(load().length + 1).padStart(4, "0")}`;
    const nowIso = new Date().toISOString();
    const konsil: Konsil = {
      id,
      patientId: input.patientId,
      createdByUserId,
      createdAt: nowIso,
      updatedAt: nowIso,
      uploadToken: uploadTokenForKonsilId(id),
      status: "submitted",
      urgency: input.urgency,
      reason: input.reason,
      clinicalDescription: input.clinicalDescription,
      symptomDuration: input.symptomDuration,
      suspectedDiagnosis: input.suspectedDiagnosis,
      previousTreatments: input.previousTreatments,
      additionalInfo: input.additionalInfo,
      selectedBodyRegions: input.selectedBodyRegions,
      images: input.images,
      messages: [],
      timeline: [
        { id: uid("t"), type: "created", at: nowIso, by: createdByName, description: "Konsil erstellt" },
        { id: uid("t"), type: "submitted", at: nowIso, by: createdByName, description: "An Dermatologie übermittelt" },
      ],
    };
    save([konsil, ...load()]);
    return konsil;
  },
  async updateStatus(id: string, status: KonsilStatus, by: string): Promise<Konsil> {
    await wait();
    const all = load();
    const idx = all.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error("Konsil nicht gefunden");
    const event: TimelineEvent = {
      id: uid("t"),
      type: status === "in_review" ? "in_review" : status === "closed" ? "closed" : "note",
      at: new Date().toISOString(),
      by,
      description: `Status geändert zu ${status}`,
    };
    all[idx] = {
      ...all[idx],
      status,
      updatedAt: new Date().toISOString(),
      timeline: [...all[idx].timeline, event],
    };
    save(all);
    return all[idx];
  },
  async addTimelineEvent(
    id: string,
    event: Omit<TimelineEvent, "id" | "at">
  ): Promise<Konsil> {
    await wait();
    const all = load();
    const idx = all.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error("Konsil nicht gefunden");
    const nowIso = new Date().toISOString();
    all[idx] = {
      ...all[idx],
      updatedAt: nowIso,
      timeline: [...all[idx].timeline, { ...event, id: uid("t"), at: nowIso }],
    };
    save(all);
    return all[idx];
  },
  async addMessage(id: string, message: Omit<Message, "id" | "createdAt">): Promise<Konsil> {
    await wait();
    const all = load();
    const idx = all.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error("Konsil nicht gefunden");
    const msg: Message = { ...message, id: uid("m"), createdAt: new Date().toISOString() };
    all[idx] = {
      ...all[idx],
      messages: [...all[idx].messages, msg],
      updatedAt: msg.createdAt,
      timeline: [
        ...all[idx].timeline,
        {
          id: uid("t"),
          type: "message",
          at: msg.createdAt,
          by: message.senderName,
          description: "Nachricht gesendet",
        },
      ],
    };
    save(all);
    return all[idx];
  },
  async submitAssessment(
    id: string,
    assessment: ExpertAssessment,
    expertUserId: string
  ): Promise<Konsil> {
    await wait();
    const all = load();
    const idx = all.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error("Konsil nicht gefunden");
    const nowIso = new Date().toISOString();
    all[idx] = {
      ...all[idx],
      status: "answered",
      assignedExpertId: expertUserId,
      expertAssessment: assessment,
      updatedAt: nowIso,
      timeline: [
        ...all[idx].timeline,
        {
          id: uid("t"),
          type: "answered",
          at: nowIso,
          by: assessment.authoredBy,
          description: "Befund übermittelt",
        },
      ],
    };
    save(all);
    return all[idx];
  },
  async saveAiAssessment(id: string, assessment: AiAssessment): Promise<Konsil> {
    await wait();
    const all = load();
    const idx = all.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error("Konsil nicht gefunden");
    all[idx] = { ...all[idx], aiAssessment: assessment };
    save(all);
    return all[idx];
  },
  async askRueckfrage(id: string, body: string, by: { role: "dermatologist" | "hausarzt"; name: string }) {
    await wait();
    const all = load();
    const idx = all.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error("Konsil nicht gefunden");
    const nowIso = new Date().toISOString();
    all[idx] = {
      ...all[idx],
      status: "rueckfrage",
      updatedAt: nowIso,
      messages: [
        ...all[idx].messages,
        { id: uid("m"), senderRole: by.role, senderName: by.name, body, createdAt: nowIso },
      ],
      timeline: [
        ...all[idx].timeline,
        { id: uid("t"), type: "rueckfrage", at: nowIso, by: by.name, description: "Rückfrage gesendet" },
      ],
    };
    save(all);
    return all[idx];
  },
};

function wait() {
  return new Promise((r) => setTimeout(r, 200));
}
