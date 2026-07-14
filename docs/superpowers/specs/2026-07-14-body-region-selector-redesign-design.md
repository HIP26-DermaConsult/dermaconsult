# Body Region Selector Redesign

## Problem

The current `BodyRegionSelector` (`src/components/konsile/BodyRegionSelector.tsx`) uses body outlines adapted from a muscle-diagram library. The result looks anatomically busy ("like a Pokemon") and the two side-by-side front/back panels are too small for precise clicking. An earlier, simpler version (rounded rects/ellipses) looked clean but only covered ~11 coarse regions per side, not the full 22-region `BodyRegionId` set now required clinically.

## Goal

Redraw the selector as a clean, minimal, anatomically-plausible silhouette that:
- Covers all 22 existing `BodyRegionId` values (no type/data changes).
- Uses simple soft shapes (ellipses, rounded rects) instead of muscle-contour polygons.
- Gives each region a large, easy-to-hit click target.
- Highlights the selected region in the existing brand blue (`brand-500`/`brand-700`), consistent with current hover/selected treatment.
- Shows one view at a time via a **"Körpervorderseite" / "Körperrückseite"** tab toggle (instead of two small side-by-side panels), so the diagram can be rendered larger.

## Non-goals

- No changes to `BodyRegionId`, `BODY_REGION_LABELS`, mock data, or any consumer of `selectedBodyRegions`.
- No change to the selected-regions badge list below the diagram (stays as-is: shows all selections across both views, removable via X, `readOnly` support unchanged).
- No change to keyboard accessibility contract (role="button", tabIndex, Enter/Space toggle, aria-pressed, aria-label) — must be preserved per region shape.

## Design

### Layout
- Tabs above the diagram: "Körpervorderseite" (default active) and "Körperrückseite". Clicking switches which region set (`FRONT` / `BACK`) is rendered; selection state (`value`/`onChange`) is shared and unaffected by tab switching.
- Single SVG per view, viewBox `0 0 100 260` (taller than the current cramped `0 0 100 200` per-panel), rendered at a larger max-width than today so click targets are bigger.
- Badge list of selected regions remains below, unchanged in behavior.

### Body geometry (per view, approximate — will be tuned visually during implementation)
All shapes are ellipses or rounded rects, continuous/adjoining to read as one body, not a scatter of disconnected blobs:

- `head`: ellipse, centered top.
- `ear-left` / `ear-right`: small ellipses flanking the head (front and back both show a sliver, consistent with current side-detection helper `sideId`).
- `neck`: small rounded rect between head and trunk.
- `shoulder-left` / `shoulder-right`: rounded caps at the top corners of the trunk, connecting neck to arms.
- `chest` (front) / `upper-back` (back): rounded rect, upper trunk.
- `abdomen` (front) / `lower-back` (back): rounded rect, lower trunk. Back view's lower-back extends further down since there's no separate back region for the groin area.
- `groin` (front only): small rounded rect below the abdomen. No equivalent region exists on the back view.
- `upper-arm-left/right`, `forearm-left/right`: stacked rounded rects down each arm.
- `hand-left/right`: ellipses at the end of each forearm.
- `thigh-left/right`, `lower-leg-left/right`: stacked rounded rects down each leg.
- `foot-left/right`: ellipses at the end of each leg.

Left/right assignment continues to use the existing `sideId` logic (patient's-left/right relative to viewer, front vs. back mirrored), reused from the current implementation.

### Visual style
- Unselected: `fill-ink-200/70 stroke-ink-300`.
- Hover (unselected): `fill-brand-200/70`.
- Selected: `fill-brand-500/70 stroke-brand-700`.
- `transition-colors` on all shapes for a smooth highlight on click.

### Component structure
- `BodyRegionSelector` keeps its existing public props (`value`, `onChange`, `readOnly`) — no API changes for consumers (e.g. `PatientSummaryCard`, konsil forms).
- Internal: add `activeView: "front" | "back"` state (default `"front"`), tab buttons to switch it, and render only the active view's `RegionShape[]`.
- `FRONT` / `BACK` region shape data replaces the current polygon-based `ANTERIOR_RAW`/`POSTERIOR_RAW` construction with the simpler shape descriptors (rect/ellipse), similar in spirit to the original pre-polygon implementation but with the fuller region list.

## Testing

- Manual visual check in the running app (patients page / konsil form wherever `BodyRegionSelector` is used) for both tabs, hover, click-to-select, click-to-deselect, and keyboard toggling.
- No automated test suite currently covers this component; none added unless requested.
