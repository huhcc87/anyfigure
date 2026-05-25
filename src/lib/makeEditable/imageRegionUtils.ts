import type { DetectedTextRegion, FigureTextNodesManifest, PixelBbox, TextRegionEntry, TextRegionManifest } from "@/types/detectedText";
import { generateId } from "@/lib/utils";

export interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ContainedImageLayout {
  offsetX: number;
  offsetY: number;
  displayW: number;
  displayH: number;
  scale: number;
}

/** Read PNG/JPEG/WebP dimensions from base64 image bytes. */
export function getImageDimensionsFromBase64(data: string, mimeType: string): { width: number; height: number } {
  const buf = typeof Buffer !== "undefined" ? Buffer.from(data, "base64") : Uint8Array.from(atob(data), (c) => c.charCodeAt(0));

  const readU32 = (i: number) =>
    typeof Buffer !== "undefined"
      ? (buf as Buffer).readUInt32BE(i)
      : ((buf[i] << 24) | (buf[i + 1] << 16) | (buf[i + 2] << 8) | buf[i + 3]) >>> 0;

  if (mimeType.includes("png") && buf.length > 24 && buf[0] === 0x89) {
    return { width: readU32(16), height: readU32(20) };
  }

  if ((mimeType.includes("jpeg") || mimeType.includes("jpg")) && buf.length > 4) {
    let i = 2;
    while (i < buf.length - 8) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      const len = (buf[i + 2] << 8) | buf[i + 3];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8) {
        return { height: (buf[i + 5] << 8) | buf[i + 6], width: (buf[i + 7] << 8) | buf[i + 8] };
      }
      i += 2 + len;
    }
  }

  // WebP: RIFF....WEBP
  if (buf.length > 30 && buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57 && buf[9] === 0x45) {
    const chunk = String.fromCharCode(buf[12], buf[13], buf[14], buf[14] === 0x56 ? buf[15] : buf[14]);
    if (chunk.startsWith("VP8")) {
      if (buf[12] === 0x56 && buf[13] === 0x50 && buf[14] === 0x38 && buf[15] === 0x20) {
        return { width: readU16LE(buf, 26) & 0x3fff, height: readU16LE(buf, 28) & 0x3fff };
      }
      if (buf[12] === 0x56 && buf[13] === 0x50 && buf[14] === 0x38 && buf[15] === 0x4c) {
        return { width: readU24LE(buf, 24) + 1, height: readU24LE(buf, 27) + 1 };
      }
    }
  }

  return { width: 1024, height: 768 };
}

function readU16LE(buf: Buffer | Uint8Array, i: number): number {
  return buf[i] | (buf[i + 1] << 8);
}

function readU24LE(buf: Buffer | Uint8Array, i: number): number {
  return buf[i] | (buf[i + 1] << 8) | (buf[i + 2] << 16);
}

/** Map pixel bbox in image space → layout box (object-contain inside cell). */
export function mapPixelBboxToLayout(
  bbox: PixelBbox,
  imageWidth: number,
  imageHeight: number,
  boxW: number,
  boxH: number,
  boxX = 0,
  boxY = 0
): LayoutRect {
  const contained = getContainedLayout(imageWidth, imageHeight, boxW, boxH);
  const [x, y, w, h] = bbox;
  return {
    x: boxX + contained.offsetX + x * contained.scale,
    y: boxY + contained.offsetY + y * contained.scale,
    w: Math.max(w * contained.scale, 8),
    h: Math.max(h * contained.scale, 6),
  };
}

export function getContainedLayout(imageWidth: number, imageHeight: number, boxW: number, boxH: number): ContainedImageLayout {
  const scale = Math.min(boxW / imageWidth, boxH / imageHeight);
  const displayW = imageWidth * scale;
  const displayH = imageHeight * scale;
  return {
    offsetX: (boxW - displayW) / 2,
    offsetY: (boxH - displayH) / 2,
    displayW,
    displayH,
    scale,
  };
}

/** Re-scale manifest bboxes when cached dimensions differ from loaded image. */
export function syncManifestToNaturalSize(
  manifest: TextRegionManifest,
  naturalWidth: number,
  naturalHeight: number
): TextRegionManifest {
  if (
    !naturalWidth ||
    !naturalHeight ||
    (naturalWidth === manifest.imageWidth && naturalHeight === manifest.imageHeight)
  ) {
    return manifest;
  }
  const sx = naturalWidth / manifest.imageWidth;
  const sy = naturalHeight / manifest.imageHeight;
  return {
    ...manifest,
    imageWidth: naturalWidth,
    imageHeight: naturalHeight,
    regions: manifest.regions.map((r) => ({
      ...r,
      bbox: [
        Math.round(r.bbox[0] * sx),
        Math.round(r.bbox[1] * sy),
        Math.max(Math.round(r.bbox[2] * sx), 4),
        Math.max(Math.round(r.bbox[3] * sy), 4),
      ] as PixelBbox,
    })),
  };
}

/** Map pixel bbox → coordinates relative to a DOM container (e.g. preview card). */
export function mapPixelBboxToContainerRect(
  bbox: PixelBbox,
  img: HTMLImageElement,
  container: HTMLElement,
  manifestW: number,
  manifestH: number
): LayoutRect {
  const root = img.closest("[data-figure-overlay-root]") as HTMLElement | null;
  const anchorRect = (root || img).getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const local = mapPixelBboxToDomRect(bbox, img, anchorRect, manifestW, manifestH);
  return {
    x: local.x + (anchorRect.left - containerRect.left),
    y: local.y + (anchorRect.top - containerRect.top),
    w: local.w,
    h: local.h,
  };
}

/** DOM: map pixel bbox using rendered <img> (uniform scale, no extra letterbox when img is w-auto/h-auto). */
export function mapPixelBboxToDomRect(
  bbox: PixelBbox,
  img: HTMLImageElement,
  containerRect: DOMRect,
  manifestW: number,
  manifestH: number
): LayoutRect {
  const layout = img.getBoundingClientRect();
  if (layout.width < 2 || layout.height < 2) {
    return { x: 0, y: 0, w: 10, h: 8 };
  }

  const naturalW = img.naturalWidth > 0 ? img.naturalWidth : manifestW;
  const naturalH = img.naturalHeight > 0 ? img.naturalHeight : manifestH;
  const scale = Math.min(layout.width / naturalW, layout.height / naturalH);
  const offsetX = (layout.width - naturalW * scale) / 2;
  const offsetY = (layout.height - naturalH * scale) / 2;

  const [x, y, w, h] = bbox;
  // Re-scale if manifest dimensions differ from actual image
  const mx = manifestW > 0 && naturalW !== manifestW ? x * (naturalW / manifestW) : x;
  const my = manifestH > 0 && naturalH !== manifestH ? y * (naturalH / manifestH) : y;
  const mw = manifestW > 0 && naturalW !== manifestW ? w * (naturalW / manifestW) : w;
  const mh = manifestH > 0 && naturalH !== manifestH ? h * (naturalH / manifestH) : h;

  return {
    x: layout.left - containerRect.left + offsetX + mx * scale,
    y: layout.top - containerRect.top + offsetY + my * scale,
    w: Math.max(mw * scale, 8),
    h: Math.max(mh * scale, 6),
  };
}

export function expandDomMaskRect(rect: LayoutRect, pad = 4): LayoutRect {
  return {
    x: Math.max(0, rect.x - pad),
    y: Math.max(0, rect.y - pad),
    w: rect.w + pad * 2,
    h: rect.h + pad * 2,
  };
}

/** Estimate font size so label fits inside box width (DOM/canvas). */
export function fitLabelFontSize(text: string, boxW: number, boxH: number, max = 13, min = 6): number {
  let fs = Math.min(max, Math.max(min, boxH - 3));
  while (fs > min && text.length * fs * 0.52 > boxW - 4) fs -= 0.5;
  return fs;
}

function iou(a: PixelBbox, b: PixelBbox): number {
  const ax2 = a[0] + a[2];
  const ay2 = a[1] + a[3];
  const bx2 = b[0] + b[2];
  const by2 = b[1] + b[3];
  const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(a[0], b[0]));
  const iy = Math.max(0, Math.min(ay2, by2) - Math.max(a[1], b[1]));
  const inter = ix * iy;
  const union = a[2] * a[3] + b[2] * b[3] - inter;
  return union > 0 ? inter / union : 0;
}

/** Fix Gemini bbox mistakes: corner coords, swapped w/h, absurd aspect ratios. */
export function sanitizeBbox(
  bbox: PixelBbox,
  text: string,
  imageWidth: number,
  imageHeight: number
): PixelBbox {
  let [x, y, w, h] = bbox.map((v) => Math.round(Number(v) || 0)) as PixelBbox;

  // Gemini often returns [x1,y1,x2,y2] instead of [x,y,w,h]
  if (w > x && h > y && w <= imageWidth * 1.02 && h <= imageHeight * 1.02) {
    const cw = w - x;
    const ch = h - y;
    if (cw >= 4 && ch >= 4 && (ch / Math.max(cw, 1) > 2 || cw / Math.max(ch, 1) > 2)) {
      w = cw;
      h = ch;
    }
  }

  // Normalized 0–1 accidentally passed as pixels (tiny boxes) — skip, handled upstream

  const estW = Math.min(Math.max(text.length * imageWidth * 0.010, 24), imageWidth * 0.42);
  const estH = Math.max(imageHeight * 0.012, 12);

  // Tall skinny boxes for horizontal text labels
  if (h > w * 2 && text.length < 60) {
    const cx = x + w / 2;
    const cy = y + Math.min(h, estH * 2) / 2;
    if (h > estH * 2.5) {
      h = estH;
      w = Math.max(w, estW);
      x = Math.round(cx - w / 2);
      y = Math.round(cy - h / 2);
    } else if (w < estW * 0.5) {
      w = estW;
      x = Math.round(cx - w / 2);
    }
  }

  // Wide flat boxes with huge width
  if (w > estW * 4 && text.length < 20) {
    const cx = x + w / 2;
    w = estW;
    x = Math.round(cx - w / 2);
  }

  if (h > w * 3 && w < 30) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    w = estW;
    h = estH;
    x = Math.round(cx - w / 2);
    y = Math.round(cy - h / 2);
  }

  x = Math.max(0, Math.min(x, imageWidth - 4));
  y = Math.max(0, Math.min(y, imageHeight - 4));
  w = Math.max(4, Math.min(w, imageWidth - x));
  h = Math.max(4, Math.min(h, imageHeight - y));

  return [x, y, w, h];
}

/** Estimate bbox width/height from label text when vision coords are unusable. */
export function estimateBboxForText(
  text: string,
  imageWidth: number,
  imageHeight: number,
  x: number,
  y: number
): PixelBbox {
  const w = Math.min(Math.max(text.length * imageWidth * 0.010, 20), imageWidth * 0.4);
  const h = Math.max(imageHeight * 0.013, 13);
  return sanitizeBbox(
    [x, y, w, h],
    text,
    imageWidth,
    imageHeight
  );
}

function normalizeTextKey(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Drop spatial duplicates (same text, overlapping or nearly same position). */
export function mergeDuplicateRegions(
  regions: TextRegionEntry[],
  imageWidth: number,
  imageHeight: number
): TextRegionEntry[] {
  const kept: TextRegionEntry[] = [];
  for (const r of regions) {
    const dupIdx = kept.findIndex((k) => {
      if (normalizeTextKey(k.text) !== normalizeTextKey(r.text)) return false;
      const dx = Math.abs(k.bbox[0] - r.bbox[0]);
      const dy = Math.abs(k.bbox[1] - r.bbox[1]);
      const close = dx < imageWidth * 0.035 && dy < imageHeight * 0.022;
      return close || iou(k.bbox, r.bbox) > 0.12;
    });
    if (dupIdx >= 0) {
      if ((r.confidence ?? 0) > (kept[dupIdx].confidence ?? 0)) kept[dupIdx] = r;
    } else {
      kept.push(r);
    }
  }
  return kept;
}

/** Filter caption blocks, tiny boxes, and duplicates. */
export function cleanTextRegions(
  regions: TextRegionEntry[],
  imageWidth: number,
  imageHeight: number,
  excludeTexts: string[] = []
): TextRegionEntry[] {
  const exclude = new Set(excludeTexts.map((t) => t.trim().toLowerCase()).filter(Boolean));
  const longExcludes = excludeTexts.filter((t) => t.trim().length > 120).map((t) => t.trim().toLowerCase());
  const imgArea = imageWidth * imageHeight;

  const filtered = regions.filter((r) => {
    const text = r.text.trim();
    if (!text || text.length < 1) return false;

    const key = text.toLowerCase();
    if (exclude.has(key)) return false;
    if (longExcludes.some((ex) => ex.includes(key) && key.length > 40)) return false;

    const [x, y, w, h] = r.bbox;
    if (w < 3 || h < 3) return false;
    if (x + w < 0 || y + h < 0 || x > imageWidth || y > imageHeight) return false;

    const aspect = h / Math.max(w, 1);
    if (aspect > 5 && text.length < 30) return false;
    if (w / Math.max(h, 1) > 15 && text.length < 6) return false;

    const area = w * h;
    const isTitle = text.length < 90 && text.includes(":");
    if (!isTitle && area / imgArea > 0.18) return false;
    if (isTitle && area / imgArea > 0.35) return false;
    if (text.length > 280) return false;
    if (text.length > 120 && h / imageHeight > 0.12 && text.split(/\s+/).length > 18) return false;

    return true;
  });

  const sanitized = filtered.map((r) => ({
    ...r,
    bbox: sanitizeBbox(r.bbox, r.text, imageWidth, imageHeight),
  }));

  return mergeDuplicateRegions(sanitized, imageWidth, imageHeight);
}

export function normalizedToPixel(
  regions: DetectedTextRegion[],
  imageWidth: number,
  imageHeight: number,
  panelId?: string
): TextRegionEntry[] {
  return regions.map((r) => ({
    id: r.id || generateId("r"),
    bbox: [
      Math.round(r.x * imageWidth),
      Math.round(r.y * imageHeight),
      Math.max(Math.round(r.w * imageWidth), 4),
      Math.max(Math.round(r.h * imageHeight), 4),
    ] as PixelBbox,
    text: r.text,
    confidence: 0.85,
    panelId,
  }));
}

export function legacyRegionsToManifest(
  regions: DetectedTextRegion[] | undefined,
  imageWidth: number,
  imageHeight: number,
  panelId?: string
): TextRegionManifest | undefined {
  if (!regions?.length) return undefined;
  return {
    imageWidth,
    imageHeight,
    regions: normalizedToPixel(regions, imageWidth, imageHeight, panelId),
    extractedAt: Date.now(),
  };
}

/** Prefer pixel manifest; fall back to legacy normalized regions. */
export function getPanelTextManifest(
  panel: {
    id?: string;
    textNodesManifest?: TextRegionManifest;
    textRegions?: DetectedTextRegion[];
    imageNaturalWidth?: number;
    imageNaturalHeight?: number;
  },
  fallbackW = 1024,
  fallbackH = 768
): TextRegionManifest | undefined {
  if (panel.textNodesManifest?.regions?.length) return panel.textNodesManifest;
  const w = panel.imageNaturalWidth || fallbackW;
  const h = panel.imageNaturalHeight || fallbackH;
  return legacyRegionsToManifest(panel.textRegions, w, h, panel.id);
}

export function buildFigureTextNodesManifest(
  panels: Array<{ id?: string; label?: string; textNodesManifest?: TextRegionManifest; textRegions?: DetectedTextRegion[] }>
): FigureTextNodesManifest {
  const regions: TextRegionEntry[] = [];
  let imageWidth = 1024;
  let imageHeight = 768;

  for (const p of panels) {
    const manifest = getPanelTextManifest(p);
    if (!manifest?.regions.length) continue;
    if (regions.length === 0) {
      imageWidth = manifest.imageWidth;
      imageHeight = manifest.imageHeight;
    }
    const panelId = p.id || p.label || "main";
    for (const r of manifest.regions) {
      regions.push({ ...r, panelId: r.panelId || panelId });
    }
  }

  return { imageWidth, imageHeight, regions };
}
