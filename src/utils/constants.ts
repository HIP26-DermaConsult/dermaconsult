import type { BodyRegionId, KonsilStatus, Urgency } from "@/types/konsil";

export const STATUS_LABELS: Record<KonsilStatus, string> = {
  draft: "Entwurf",
  submitted: "Eingereicht",
  in_review: "In Bearbeitung",
  rueckfrage: "Rückfrage",
  answered: "Beantwortet",
  closed: "Abgeschlossen",
};

export const STATUS_COLORS: Record<KonsilStatus, string> = {
  draft: "bg-ink-100 text-ink-700 ring-ink-200",
  submitted: "bg-brand-50 text-brand-700 ring-brand-200",
  in_review: "bg-amber-50 text-amber-700 ring-amber-200",
  rueckfrage: "bg-violet-50 text-violet-700 ring-violet-200",
  answered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-ink-100 text-ink-600 ring-ink-200",
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  routine: "Routine",
  soon: "Zeitnah",
  urgent: "Dringend",
};

export const URGENCY_COLORS: Record<Urgency, string> = {
  routine: "bg-ink-100 text-ink-700 ring-ink-200",
  soon: "bg-amber-50 text-amber-700 ring-amber-200",
  urgent: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const BODY_REGION_LABELS: Record<BodyRegionId, string> = {
  head: "Kopf / Gesicht",
  neck: "Hals",
  chest: "Brust",
  abdomen: "Bauch",
  back: "Rücken",
  "arm-left": "Arm links",
  "arm-right": "Arm rechts",
  "hand-left": "Hand links",
  "hand-right": "Hand rechts",
  "leg-left": "Bein links",
  "leg-right": "Bein rechts",
  "foot-left": "Fuß links",
  "foot-right": "Fuß rechts",
};
