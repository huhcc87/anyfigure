"use client";

import { memo, useEffect, useState } from "react";
import type { TextRegionManifest } from "@/types/detectedText";
import { mapPixelBboxToContainerRect, sanitizeBbox, syncManifestToNaturalSize } from "@/lib/makeEditable/imageRegionUtils";

interface LabelLayout {
  id: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
}

interface EditableLabelsLayerProps {
  container: HTMLElement | null;
  panelId: string;
  manifest: TextRegionManifest;
  /** Pending edits keyed by region id (overlay on manifest text). */
  edits?: Record<string, string>;
  /** When set, only render overlays for these region ids (avoids ghosting unchanged labels). */
  onlyIds?: string[];
  interactive?: boolean;
  onLabelClick?: (id: string) => void;
}

function measureLabels(
  container: HTMLElement,
  panelId: string,
  manifest: TextRegionManifest,
  edits: Record<string, string>,
  onlyIds?: string[]
): LabelLayout[] {
  const img =
    (container.querySelector(`[data-figure-image="${panelId}"]`) as HTMLImageElement | null) ||
    (container.querySelector("[data-figure-image]") as HTMLImageElement | null);
  if (!img || img.naturalWidth === 0) return [];

  const synced = syncManifestToNaturalSize(manifest, img.naturalWidth, img.naturalHeight);

  return synced.regions
    .filter((r) => !onlyIds?.length || onlyIds.includes(r.id))
    .map((r) => {
      const bbox = sanitizeBbox(r.bbox, r.text, synced.imageWidth, synced.imageHeight);
      const layout = mapPixelBboxToContainerRect(bbox, img, container, synced.imageWidth, synced.imageHeight);
      const text = edits[r.id] ?? r.text;

      // ── AGGRESSIVE MASK SIZING ──
      // Gemini Vision bboxes are tight to the text glyphs and often
      // off-center by 5-20 px. The original raster text plus anti-aliasing
      // halo can extend ~25-40 % of the text height past the bbox in every
      // direction. We need the mask to cover BOTH the originally-bboxed
      // region AND the leaked raster text around it.
      //
      // Strategy: grow generously and center the mask on the bbox CENTER
      // (not anchor it to top-left) so growth is symmetric.
      const fontSize = Math.max(8, Math.min(16, Math.round(layout.h * 0.85)));
      // Width must accommodate the longer of (original bbox width) and
      // (rendered edit text width @ this font).
      const estimatedTextW = text.length * fontSize * 0.58 + 12;
      const baseW = Math.max(layout.w, estimatedTextW);
      const baseH = Math.max(layout.h, fontSize * 1.4);
      // Expansion: at LEAST 18 px or 35 % of the larger dimension on EACH side.
      const padX = Math.max(18, baseW * 0.35);
      const padY = Math.max(12, baseH * 0.55);

      const cx = layout.x + layout.w / 2;
      const cy = layout.y + layout.h / 2;
      const finalW = baseW + padX * 2;
      const finalH = baseH + padY * 2;
      return {
        id: r.id,
        text,
        x: Math.max(0, cx - finalW / 2),
        y: Math.max(0, cy - finalH / 2),
        w: finalW,
        h: finalH,
        fontSize,
      };
    });
}

/** Renders editable text labels over an AI figure image (masks baked raster text). */
export const EditableLabelsLayer = memo(function EditableLabelsLayer({
  container,
  panelId,
  manifest,
  edits = {},
  onlyIds,
  interactive = false,
  onLabelClick,
}: EditableLabelsLayerProps) {
  const [labels, setLabels] = useState<LabelLayout[]>([]);

  useEffect(() => {
    if (!container || !manifest.regions.length) {
      setLabels([]);
      return;
    }

    const measure = () => setLabels(measureLabels(container, panelId, manifest, edits, onlyIds));
    measure();

    const img = container.querySelector(`[data-figure-image="${panelId}"]`) || container.querySelector("[data-figure-image]");
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    if (img) {
      ro.observe(img);
      img.addEventListener("load", measure);
    }
    return () => {
      ro.disconnect();
      if (img) img.removeEventListener("load", measure);
    };
  }, [container, panelId, manifest, edits, onlyIds]);

  if (!labels.length) return null;

  return (
    <div className="absolute inset-0 z-[5] pointer-events-none">
      {labels.map((lb) => (
        <div
          key={lb.id}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          className="absolute flex items-center justify-center leading-none"
          style={{
            left: lb.x,
            top: lb.y,
            width: lb.w,
            height: lb.h,
            fontSize: lb.fontSize,
            fontWeight: 600,
            color: "#111827",
            // SOLID white surface — no transparency. Combined with a 3-layer
            // white halo this annihilates anti-aliased raster text underneath.
            background: "#ffffff",
            borderRadius: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textAlign: "center",
            // Three concentric white halos so coverage extends far enough
            // that 5-20 px of bbox offset from Gemini never reveals the
            // original baked text underneath.
            boxShadow:
              "0 0 0 2px #ffffff, 0 0 0 4px #ffffff, 0 0 6px 4px rgba(255,255,255,0.95)",
            pointerEvents: interactive ? "auto" : "none",
            cursor: interactive ? "text" : undefined,
          }}
          onClick={interactive && onLabelClick ? () => onLabelClick(lb.id) : undefined}
          title={lb.text}
        >
          {lb.text}
        </div>
      ))}
    </div>
  );
});
