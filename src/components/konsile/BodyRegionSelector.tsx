import { useMemo, useState } from "react";
import type { BodyRegionId } from "@/types/konsil";
import { BODY_REGION_LABELS } from "@/utils/constants";
import { Badge } from "@/components/ui/Badge";
import { X } from "lucide-react";
import { cn } from "@/utils/formatters";

type ShapeDef =
  | { type: "rect"; x: number; y: number; w: number; h: number; rx: number }
  | { type: "ellipse"; cx: number; cy: number; rx: number; ry: number };

interface RegionShape {
  id: BodyRegionId;
  view: "front" | "back";
  shape: ShapeDef;
}

// Simplified anatomical silhouette on a 100x260 viewport: soft rounded
// shapes only (no muscle contours), assembled so adjoining pieces overlap
// slightly and read as one continuous body.
const HEAD: ShapeDef = { type: "ellipse", cx: 50, cy: 20, rx: 15, ry: 17 };
const NECK: ShapeDef = { type: "rect", x: 43, y: 35, w: 14, h: 11, rx: 4 };

const CHEST: ShapeDef = { type: "rect", x: 30, y: 46, w: 40, h: 38, rx: 12 };
const ABDOMEN: ShapeDef = { type: "rect", x: 32, y: 84, w: 36, h: 34, rx: 10 };
const GROIN: ShapeDef = { type: "rect", x: 38, y: 118, w: 24, h: 16, rx: 8 };

const UPPER_BACK: ShapeDef = { type: "rect", x: 30, y: 46, w: 40, h: 38, rx: 12 };
const LOWER_BACK: ShapeDef = { type: "rect", x: 32, y: 84, w: 36, h: 50, rx: 10 };

// Lateral (paired) shapes, defined once on the image-left side and mirrored
// for the image-right side; sideId() below maps each to patient left/right.
const EAR_BASE: ShapeDef = { type: "ellipse", cx: 34, cy: 20, rx: 4, ry: 6 };
const SHOULDER_BASE: ShapeDef = { type: "rect", x: 18, y: 46, w: 14, h: 16, rx: 7 };
const UPPER_ARM_BASE: ShapeDef = { type: "rect", x: 10, y: 48, w: 14, h: 46, rx: 7 };
const FOREARM_BASE: ShapeDef = { type: "rect", x: 10, y: 94, w: 14, h: 42, rx: 7 };
const HAND_BASE: ShapeDef = { type: "ellipse", cx: 17, cy: 144, rx: 10, ry: 12 };
const THIGH_BASE: ShapeDef = { type: "rect", x: 33, y: 134, w: 15, h: 48, rx: 8 };
const LOWER_LEG_BASE: ShapeDef = { type: "rect", x: 34, y: 182, w: 13, h: 46, rx: 7 };
const FOOT_BASE: ShapeDef = { type: "ellipse", cx: 40, cy: 236, rx: 9, ry: 8 };

const LATERAL_BASES: { base: string; shape: ShapeDef }[] = [
  { base: "ear-", shape: EAR_BASE },
  { base: "shoulder-", shape: SHOULDER_BASE },
  { base: "upper-arm-", shape: UPPER_ARM_BASE },
  { base: "forearm-", shape: FOREARM_BASE },
  { base: "hand-", shape: HAND_BASE },
  { base: "thigh-", shape: THIGH_BASE },
  { base: "lower-leg-", shape: LOWER_LEG_BASE },
  { base: "foot-", shape: FOOT_BASE },
];

function shapeCenterX(shape: ShapeDef): number {
  return shape.type === "rect" ? shape.x + shape.w / 2 : shape.cx;
}

function mirrorShape(shape: ShapeDef): ShapeDef {
  if (shape.type === "rect") return { ...shape, x: 100 - shape.x - shape.w };
  return { ...shape, cx: 100 - shape.cx };
}

// Front view faces the viewer, so the image-left half shows the patient's
// right side; the back view is mirrored the other way. Front and back are
// always distinct regions (e.g. a mole on the forearm's front vs. back
// surface is a different, separately selectable spot).
function sideId(base: string, centerX: number, view: "front" | "back"): BodyRegionId {
  const imageLeftHalf = centerX < 50;
  const isPatientLeft = view === "front" ? !imageLeftHalf : imageLeftHalf;
  return `${base}${isPatientLeft ? "left" : "right"}-${view}` as BodyRegionId;
}

function buildView(view: "front" | "back"): RegionShape[] {
  const shapes: RegionShape[] = [
    { id: `head-${view}` as BodyRegionId, view, shape: HEAD },
    { id: `neck-${view}` as BodyRegionId, view, shape: NECK },
  ];

  if (view === "front") {
    shapes.push(
      { id: "chest", view, shape: CHEST },
      { id: "abdomen", view, shape: ABDOMEN },
      { id: "groin", view, shape: GROIN },
    );
  } else {
    shapes.push(
      { id: "upper-back", view, shape: UPPER_BACK },
      { id: "lower-back", view, shape: LOWER_BACK },
    );
  }

  for (const { base, shape } of LATERAL_BASES) {
    const mirrored = mirrorShape(shape);
    shapes.push(
      { id: sideId(base, shapeCenterX(shape), view), view, shape },
      { id: sideId(base, shapeCenterX(mirrored), view), view, shape: mirrored },
    );
  }

  return shapes;
}

const FRONT: RegionShape[] = buildView("front");
const BACK: RegionShape[] = buildView("back");

function RegionShapeEl({
  region,
  selected,
  onToggle,
}: {
  region: RegionShape;
  selected: boolean;
  onToggle: () => void;
}) {
  const fill = selected
    ? "fill-brand-500/70 stroke-brand-700"
    : "fill-ink-200/70 stroke-ink-300 hover:fill-brand-200/70";
  const common = {
    onClick: onToggle,
    className: cn("cursor-pointer transition-colors", fill),
    role: "button" as const,
    tabIndex: 0,
    "aria-label": BODY_REGION_LABELS[region.id],
    "aria-pressed": selected,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
  };
  if (region.shape.type === "rect") {
    const s = region.shape;
    return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} strokeWidth={1.5} {...common} />;
  }
  const s = region.shape;
  return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} strokeWidth={1.5} {...common} />;
}

export function BodyRegionSelector({
  value,
  onChange,
  readOnly = false,
}: {
  value: BodyRegionId[];
  onChange?: (next: BodyRegionId[]) => void;
  readOnly?: boolean;
}) {
  const [activeView, setActiveView] = useState<"front" | "back">("front");
  const set = useMemo(() => new Set(value), [value]);

  function toggle(id: BodyRegionId) {
    if (readOnly || !onChange) return;
    const next = set.has(id) ? value.filter((v) => v !== id) : [...value, id];
    onChange(next);
  }

  const regions = activeView === "front" ? FRONT : BACK;

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-1 rounded-lg bg-ink-100 p-1 max-w-[260px] mx-auto">
        {(
          [
            { key: "front", label: "Körpervorderseite" },
            { key: "back", label: "Körperrückseite" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveView(key)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-[11px] leading-tight font-medium whitespace-nowrap transition-colors",
              activeView === key ? "bg-white text-ink-900 shadow-sm" : "text-ink-600 hover:text-ink-900",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-3 max-w-[200px] mx-auto">
        <svg
          viewBox="0 0 100 260"
          className="w-full h-auto"
          aria-label={activeView === "front" ? "Körpervorderseite" : "Körperrückseite"}
        >
          {regions.map((r, i) => (
            <RegionShapeEl
              key={`${r.view}-${r.id}-${i}`}
              region={r}
              selected={set.has(r.id)}
              onToggle={() => toggle(r.id)}
            />
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[28px]">
        {value.length === 0 ? (
          <span className="text-xs text-ink-500">Keine Region ausgewählt</span>
        ) : (
          value.map((id) => (
            <Badge key={id} className="bg-brand-50 text-brand-700 ring-brand-200">
              {BODY_REGION_LABELS[id]}
              {!readOnly && (
                <button
                  onClick={() => toggle(id)}
                  className="hover:text-brand-900"
                  aria-label={`Entfernen ${BODY_REGION_LABELS[id]}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
