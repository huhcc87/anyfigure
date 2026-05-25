"use client";

import { memo, useEffect, useState } from "react";
import type { TextRegionManifest } from "@/types/detectedText";
import { fitLabelFontSize, expandDomMaskRect, mapPixelBboxToContainerRect, sanitizeBbox, syncManifestToNaturalSize } from "@/lib/makeEditable/imageRegionUtils";

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
    const mask = expandDomMaskRect(layout, 4);
    const fontSize = Math.max(7, Math.min(13, Math.round(layout.h * 0.78)));
    return {
      id: r.id,
      text: edits[r.id] ?? r.text,
      x: mask.x,
      y: mask.y,
      w: mask.w,
      h: mask.h,
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
          className="absolute leading-none"
          style={{
            left: lb.x,
            top: lb.y,
            width: lb.w,
            minHeight: lb.h,
            fontSize: fitLabelFontSize(lb.text, lb.w, lb.h),
            fontWeight: 600,
            color: "#111827",
            background: "#ffffff",
            padding: "2px 4px",
            borderRadius: 2,
            whiteSpace: "nowrap",
            overflow: "visible",
            boxShadow: "0 0 0 2px #ffffff",
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
