import { useMemo } from "react";
import type { BodyRegionId } from "@/types/konsil";
import { BODY_REGION_LABELS } from "@/utils/constants";
import { Badge } from "@/components/ui/Badge";
import { X } from "lucide-react";
import { cn } from "@/utils/formatters";

interface RegionShape {
  id: BodyRegionId;
  view: "front" | "back";
  // Polygon / circle / rect approximation
  shape:
    | { type: "rect"; x: number; y: number; w: number; h: number; rx?: number }
    | { type: "ellipse"; cx: number; cy: number; rx: number; ry: number };
}

// Stylized body schematic — front and back views.
// Coordinates are in a 200x500 viewport per view; rendered side by side.
const FRONT: RegionShape[] = [
  { id: "head", view: "front", shape: { type: "ellipse", cx: 100, cy: 40, rx: 26, ry: 30 } },
  { id: "neck", view: "front", shape: { type: "rect", x: 88, y: 68, w: 24, h: 16, rx: 4 } },
  { id: "chest", view: "front", shape: { type: "rect", x: 64, y: 88, w: 72, h: 50, rx: 10 } },
  { id: "abdomen", view: "front", shape: { type: "rect", x: 70, y: 142, w: 60, h: 60, rx: 10 } },
  { id: "arm-right", view: "front", shape: { type: "rect", x: 30, y: 92, w: 26, h: 110, rx: 12 } },
  { id: "arm-left", view: "front", shape: { type: "rect", x: 144, y: 92, w: 26, h: 110, rx: 12 } },
  { id: "hand-right", view: "front", shape: { type: "ellipse", cx: 43, cy: 220, rx: 14, ry: 18 } },
  { id: "hand-left", view: "front", shape: { type: "ellipse", cx: 157, cy: 220, rx: 14, ry: 18 } },
  { id: "leg-right", view: "front", shape: { type: "rect", x: 72, y: 208, w: 24, h: 200, rx: 12 } },
  { id: "leg-left", view: "front", shape: { type: "rect", x: 104, y: 208, w: 24, h: 200, rx: 12 } },
  { id: "foot-right", view: "front", shape: { type: "ellipse", cx: 84, cy: 422, rx: 16, ry: 12 } },
  { id: "foot-left", view: "front", shape: { type: "ellipse", cx: 116, cy: 422, rx: 16, ry: 12 } },
];

const BACK: RegionShape[] = [
  { id: "head", view: "back", shape: { type: "ellipse", cx: 100, cy: 40, rx: 26, ry: 30 } },
  { id: "neck", view: "back", shape: { type: "rect", x: 88, y: 68, w: 24, h: 16, rx: 4 } },
  { id: "back", view: "back", shape: { type: "rect", x: 64, y: 88, w: 72, h: 114, rx: 10 } },
  { id: "arm-left", view: "back", shape: { type: "rect", x: 30, y: 92, w: 26, h: 110, rx: 12 } },
  { id: "arm-right", view: "back", shape: { type: "rect", x: 144, y: 92, w: 26, h: 110, rx: 12 } },
  { id: "hand-left", view: "back", shape: { type: "ellipse", cx: 43, cy: 220, rx: 14, ry: 18 } },
  { id: "hand-right", view: "back", shape: { type: "ellipse", cx: 157, cy: 220, rx: 14, ry: 18 } },
  { id: "leg-left", view: "back", shape: { type: "rect", x: 72, y: 208, w: 24, h: 200, rx: 12 } },
  { id: "leg-right", view: "back", shape: { type: "rect", x: 104, y: 208, w: 24, h: 200, rx: 12 } },
  { id: "foot-left", view: "back", shape: { type: "ellipse", cx: 84, cy: 422, rx: 16, ry: 12 } },
  { id: "foot-right", view: "back", shape: { type: "ellipse", cx: 116, cy: 422, rx: 16, ry: 12 } },
];

function RegionShapeEl({
  region,
  selected,
  onToggle,
}: {
  region: RegionShape;
  selected: boolean;
  onToggle: () => void;
}) {
  const fill = selected ? "fill-brand-500/70 stroke-brand-700" : "fill-ink-200/70 stroke-ink-300 hover:fill-brand-200/70";
  const common = {
    onClick: onToggle,
    className: cn("cursor-pointer transition-colors", fill),
    role: "button",
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
    return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx ?? 6} strokeWidth={1.5} {...common} />;
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
  const set = useMemo(() => new Set(value), [value]);

  function toggle(id: BodyRegionId) {
    if (readOnly || !onChange) return;
    const next = set.has(id) ? value.filter((v) => v !== id) : [...value, id];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 max-w-md">
        {[
          { label: "Vorderseite", regions: FRONT },
          { label: "Rückseite", regions: BACK },
        ].map(({ label, regions }) => (
          <div key={label} className="rounded-lg border border-ink-200 bg-ink-50/50 p-3">
            <div className="text-xs font-medium text-ink-600 text-center mb-2">{label}</div>
            <svg viewBox="0 0 200 460" className="w-full h-auto" aria-label={`Körperansicht ${label}`}>
              {regions.map((r) => (
                <RegionShapeEl
                  key={`${r.view}-${r.id}`}
                  region={r}
                  selected={set.has(r.id)}
                  onToggle={() => toggle(r.id)}
                />
              ))}
            </svg>
          </div>
        ))}
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
