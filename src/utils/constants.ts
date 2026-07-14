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
  "head-front": "Kopf / Gesicht",
  "head-back": "Hinterkopf",
  "ear-left-front": "Ohr links (vorne)",
  "ear-left-back": "Ohr links (hinten)",
  "ear-right-front": "Ohr rechts (vorne)",
  "ear-right-back": "Ohr rechts (hinten)",
  "neck-front": "Hals",
  "neck-back": "Nacken",
  chest: "Brust",
  abdomen: "Bauch",
  groin: "Leiste / Genitalbereich",
  "upper-back": "Oberer Rücken",
  "lower-back": "Unterer Rücken",
  "shoulder-left-front": "Schulter links (vorne)",
  "shoulder-left-back": "Schulter links (hinten)",
  "shoulder-right-front": "Schulter rechts (vorne)",
  "shoulder-right-back": "Schulter rechts (hinten)",
  "upper-arm-left-front": "Oberarm links (vorne)",
  "upper-arm-left-back": "Oberarm links (hinten)",
  "upper-arm-right-front": "Oberarm rechts (vorne)",
  "upper-arm-right-back": "Oberarm rechts (hinten)",
  "forearm-left-front": "Unterarm links (vorne)",
  "forearm-left-back": "Unterarm links (hinten)",
  "forearm-right-front": "Unterarm rechts (vorne)",
  "forearm-right-back": "Unterarm rechts (hinten)",
  "hand-left-front": "Hand links (Innenfläche)",
  "hand-left-back": "Hand links (Handrücken)",
  "hand-right-front": "Hand rechts (Innenfläche)",
  "hand-right-back": "Hand rechts (Handrücken)",
  "thigh-left-front": "Oberschenkel links (vorne)",
  "thigh-left-back": "Oberschenkel links (hinten)",
  "thigh-right-front": "Oberschenkel rechts (vorne)",
  "thigh-right-back": "Oberschenkel rechts (hinten)",
  "lower-leg-left-front": "Unterschenkel links (vorne)",
  "lower-leg-left-back": "Unterschenkel links (hinten)",
  "lower-leg-right-front": "Unterschenkel rechts (vorne)",
  "lower-leg-right-back": "Unterschenkel rechts (hinten)",
  "foot-left-front": "Fuß links (Spann)",
  "foot-left-back": "Fuß links (Ferse)",
  "foot-right-front": "Fuß rechts (Spann)",
  "foot-right-back": "Fuß rechts (Ferse)",
};
