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

/** Read PNG/JPEG dimensions from base64 image bytes. */
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

  return { width: 1024, height: 768 };
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

/** DOM: map pixel bbox using rendered <img> with object-contain. */
export function mapPixelBboxToDomRect(
  bbox: PixelBbox,
  img: HTMLImageElement,
  containerRect: DOMRect,
  manifestW: number,
  manifestH: number
): LayoutRect {
  const layout = img.getBoundingClientRect();
  const naturalW = manifestW || img.naturalWidth || layout.width;
  const naturalH = manifestH || img.naturalHeight || layout.height;
  const contained = getContainedLayout(naturalW, naturalH, layout.width, layout.height);
  const [x, y, w, h] = bbox;
  return {
    x: layout.left - containerRect.left + contained.offsetX + x * contained.scale,
    y: layout.top - containerRect.top + contained.offsetY + y * contained.scale,
    w: Math.max(w * contained.scale, 10),
    h: Math.max(h * contained.scale, 8),
  };
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

/** Filter caption blocks, tiny boxes, and duplicates. */
export function cleanTextRegions(
  regions: TextRegionEntry[],
  imageWidth: number,
  imageHeight: number,
  excludeTexts: string[] = []
): TextRegionEntry[] {
  const exclude = new Set(excludeTexts.map((t) => t.trim().toLowerCase()).filter(Boolean));
  const imgArea = imageWidth * imageHeight;

  const filtered = regions.filter((r) => {
    const text = r.text.trim();
    if (!text || text.length < 1) return false;
    if (exclude.has(text.toLowerCase())) return false;

    const [x, y, w, h] = r.bbox;
    if (w < 4 || h < 4) return false;
    if (x + w < 0 || y + h < 0 || x > imageWidth || y > imageHeight) return false;

    const area = w * h;
    if (area / imgArea > 0.12) return false;
    if (text.length > 100 && h / imageHeight > 0.06) return false;
    if (text.length > 200) return false;

    return true;
  });

  const kept: TextRegionEntry[] = [];
  for (const r of filtered) {
    const dup = kept.some(
      (k) =>
        k.text.toLowerCase() === r.text.toLowerCase() &&
        (iou(k.bbox, r.bbox) > 0.35 || Math.abs(k.bbox[0] - r.bbox[0]) < 6)
    );
    if (!dup) kept.push(r);
  }
  return kept;
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
