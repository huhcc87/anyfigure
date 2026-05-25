import type { TextRegionEntry, TextRegionManifest } from "@/types/detectedText";
import { generateId } from "@/lib/utils";
import {
  cleanTextRegions,
  sanitizeBbox,
} from "@/lib/makeEditable/imageRegionUtils";
import { resolveImageDimensions } from "@/lib/makeEditable/resolveImageDimensions.server";

import { TEXT_MANIFEST_VERSION } from "@/lib/makeEditable/textManifestConstants";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

function stripDataUrl(dataUrl: string): { data: string; mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: "image/png", data: dataUrl };
}

function clamp01(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
}

/**
 * Robust bbox parser — Gemini routinely ignores the prompt's format spec and
 * returns one of THREE possible bbox conventions. We auto-detect which one:
 *   A) [x, y, w, h] normalized 0.0–1.0       (our requested format)
 *   B) [y_min, x_min, y_max, x_max] in 0–1000 ints  (Gemini object-detection native)
 *   C) [x, y, w, h] in raw image pixels
 *
 * Wrong-format detection symptoms: labels appear systematically shifted from the
 * baked-in raster text, often by ~text-width or with X/Y swapped.
 */
function decodeBboxToPixels(
  vals: number[],
  imageWidth: number,
  imageHeight: number
): [number, number, number, number] {
  const maxVal = Math.max(...vals);
  const allLeqOne = vals.every((v) => v >= 0 && v <= 1);
  const allLeq1000 = vals.every((v) => v >= 0 && v <= 1000);

  // Format A: normalized 0–1 [x, y, w, h]
  if (allLeqOne) {
    // Auto-detect [x1, y1, x2, y2] corner format hidden inside 0–1 range:
    // if vals[2] > vals[0] AND vals[3] > vals[1] AND BOTH would make w > 0.3 or h > 0.1
    // (impossibly large for a single label), treat as corners.
    const asW = vals[2];
    const asH = vals[3];
    const looksLikeCorners =
      vals[2] > vals[0] &&
      vals[3] > vals[1] &&
      (asW > 0.35 || asH > 0.08) &&
      vals[2] - vals[0] < 0.5 &&
      vals[3] - vals[1] < 0.1;
    if (looksLikeCorners) {
      return [
        Math.round(vals[0] * imageWidth),
        Math.round(vals[1] * imageHeight),
        Math.max(Math.round((vals[2] - vals[0]) * imageWidth), 4),
        Math.max(Math.round((vals[3] - vals[1]) * imageHeight), 4),
      ];
    }
    return [
      Math.round(vals[0] * imageWidth),
      Math.round(vals[1] * imageHeight),
      Math.max(Math.round(vals[2] * imageWidth), 4),
      Math.max(Math.round(vals[3] * imageHeight), 4),
    ];
  }

  // Format B: Gemini's native [y_min, x_min, y_max, x_max] in 0–1000
  // Heuristic: in this format vals[2] > vals[0] AND vals[3] > vals[1] (corners increase),
  // AND vals[2]+vals[3] are larger than vals[0]+vals[1] by a meaningful amount.
  if (allLeq1000 && maxVal > 1 && vals[2] > vals[0] && vals[3] > vals[1]) {
    const y1 = (vals[0] / 1000) * imageHeight;
    const x1 = (vals[1] / 1000) * imageWidth;
    const y2 = (vals[2] / 1000) * imageHeight;
    const x2 = (vals[3] / 1000) * imageWidth;
    return [
      Math.round(x1),
      Math.round(y1),
      Math.max(Math.round(x2 - x1), 4),
      Math.max(Math.round(y2 - y1), 4),
    ];
  }

  // Format C: raw pixels [x, y, w, h]
  return [
    Math.max(0, Math.round(vals[0])),
    Math.max(0, Math.round(vals[1])),
    Math.max(Math.round(vals[2]), 4),
    Math.max(Math.round(vals[3]), 4),
  ];
}

function parseGeminiRegions(raw: string, imageWidth: number, imageHeight: number): TextRegionEntry[] {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return [];

  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as {
    regions?: Array<{
      text?: string;
      bbox?: number[];
      x?: number;
      y?: number;
      w?: number;
      h?: number;
      confidence?: number;
    }>;
  };

  if (!Array.isArray(parsed.regions)) return [];

  return parsed.regions
    .filter((r) => r.text?.trim())
    .map((r) => {
      let bbox: [number, number, number, number];
      if (Array.isArray(r.bbox) && r.bbox.length >= 4) {
        const vals = r.bbox.map((v) => Number(v));
        bbox = sanitizeBbox(
          decodeBboxToPixels(vals, imageWidth, imageHeight),
          r.text!.trim(),
          imageWidth,
          imageHeight
        );
      } else {
        bbox = sanitizeBbox(
          [
            Math.round(clamp01(r.x ?? 0) * imageWidth),
            Math.round(clamp01(r.y ?? 0) * imageHeight),
            Math.max(Math.round(clamp01(r.w ?? 0.1, 0.02, 1) * imageWidth), 4),
            Math.max(Math.round(clamp01(r.h ?? 0.03, 0.01, 1) * imageHeight), 4),
          ],
          r.text!.trim(),
          imageWidth,
          imageHeight
        );
      }
      return {
        id: generateId("r"),
        bbox,
        text: r.text!.trim(),
        confidence: typeof r.confidence === "number" ? r.confidence : 0.88,
        originalText: r.text!.trim(),
      };
    });
}

export interface ExtractFigureTextOptions {
  excludeTexts?: string[];
  panelId?: string;
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buf = await res.arrayBuffer();
  const ct = res.headers.get("content-type") || "image/png";
  return { data: Buffer.from(buf).toString("base64"), mimeType: ct.split(";")[0] };
}

/** Extract text regions from figure image → pixel manifest (FigureLabs-style). */
export async function extractTextFromFigureImage(
  imageUrl: string,
  options?: ExtractFigureTextOptions
): Promise<{ manifest: TextRegionManifest; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  // Gemini 2.5 Pro is significantly more accurate at spatial bbox detection
  // on dense scientific figures than Flash. The cost is worth the accuracy.
  const model = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-pro";

  let data: string;
  let mimeType: string;
  if (imageUrl.startsWith("data:")) {
    ({ data, mimeType } = stripDataUrl(imageUrl));
  } else if (imageUrl.startsWith("http")) {
    ({ data, mimeType } = await fetchImageAsBase64(imageUrl));
  } else {
    ({ data, mimeType } = stripDataUrl(imageUrl));
  }

  const { width: imageWidth, height: imageHeight } = await resolveImageDimensions(data, mimeType);

  const prompt = `You are a precise OCR system. Analyze this scientific figure (${imageWidth}×${imageHeight}px) and return the pixel location of EVERY visible text label so we can draw an editable text box exactly on top of it.

OUTPUT FORMAT — return ONLY this JSON shape, nothing else:
{"regions":[
  {"text":"METTL3","bbox":[0.28,0.15,0.06,0.02],"confidence":0.95},
  {"text":"H3K4me3","bbox":[0.45,0.32,0.08,0.018],"confidence":0.93}
]}

═══ THE bbox FIELD — READ CAREFULLY ═══

bbox = [x, y, width, height] where ALL four numbers are DECIMAL fractions between 0.0 and 1.0

  • x      = fraction from the LEFT edge of the image to the LEFT edge of the text glyphs
  • y      = fraction from the TOP edge of the image to the TOP edge of the text glyphs
  • width  = fraction of image width covered horizontally by the text
  • height = fraction of image height covered vertically by ONE LINE of text

CORRECT EXAMPLE: text "METTL3" is rendered in the image with its leftmost pixel at horizontal position 28% across, its topmost pixel at 15% down, spans 6% of the image width and 2% of the image height.
  → CORRECT: {"text":"METTL3","bbox":[0.28, 0.15, 0.06, 0.02]}

═══ FORMATS THAT WILL BREAK THE EDITOR — NEVER RETURN THESE ═══

WRONG: [280, 150, 340, 170]                — pixels, or 0-1000 corners. We need fractions 0-1.
WRONG: [0.15, 0.28, 0.17, 0.34]            — y_min,x_min,y_max,x_max (Gemini's native format). Axes are SWAPPED and these are corners not w/h.
WRONG: [0.28, 0.15, 0.34, 0.17]            — x1,y1,x2,y2 corners. We need width/height not the second corner.
WRONG: [0.31, 0.16, 0.06, 0.02]            — bbox centered on the text instead of anchored to the top-left. Subtract w/2 from x and h/2 from y if you computed center.

═══ SELF-CHECK before responding ═══

For EVERY region you output, verify:
  ✓ Each of x, y, w, h is a decimal between 0.0 and 1.0 (no integers, no values > 1)
  ✓ w < 0.35 for single-word labels (text rarely spans more than a third of the image)
  ✓ h is small: 0.010 < h < 0.05 (one line of text is thin)
  ✓ x + w ≤ 1.0 and y + h ≤ 1.0
  ✓ The bbox top-left corner sits at the top-left pixel of the FIRST glyph — not the center

Be EXHAUSTIVE — detect EVERY readable text string in the diagram, including:
- Panel titles (e.g. "Panel A: ...")
- Column/section headers (e.g. "Normal", "Adenoma with Obesity")
- Sub-headers and stats (e.g. "log2 FC ≥ 2 or ≤ -2, p < 0.05")
- Gene/protein names inside shapes (IRS1, β-catenin, S6K1, PI3K, mTOR)
- miRNA names (miR-34a, miR-455, miR-378a, miR-219b, miR-133b)
- Pathway labels (Insulin Pathway, Wnt/β-catenin Pathway, mTOR Pathway)
- Receptor names, histone marks (H3K4me3, H3K27me3), axis labels, arrows labels
- Text inside colored boxes and ovals

Only EXCLUDE: multi-sentence paragraph captions at the very bottom (3+ sentences), and duplicate entries at the same spot.
Use exact text as shown. Aim for 40–80 regions on complex pathway diagrams.`;

  // Try Pro first (better accuracy); fall back to Flash if Pro errors / no regions
  // (e.g. account not entitled to Pro, or quota exhaustion).
  const runWithModel = async (modelName: string): Promise<TextRegionEntry[]> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);
    try {
      const res = await fetch(`${GEMINI_BASE}/models/${modelName}:generateContent`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ inlineData: { mimeType, data } }, { text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.05,
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
          },
        }),
      });

      const body = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string };
      };

      if (!res.ok) {
        throw new Error(body.error?.message || `Gemini vision error (${res.status})`);
      }

      const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      return parseGeminiRegions(text, imageWidth, imageHeight);
    } finally {
      clearTimeout(timeout);
    }
  };

  let raw: TextRegionEntry[] = [];
  let usedModel = model;
  try {
    raw = await runWithModel(model);
    if (raw.length === 0 && model !== "gemini-2.5-flash") {
      console.warn(`[gemini-vision] ${model} returned 0 regions, falling back to flash`);
      raw = await runWithModel("gemini-2.5-flash");
      usedModel = "gemini-2.5-flash";
    }
  } catch (err) {
    if (model !== "gemini-2.5-flash") {
      console.warn(`[gemini-vision] ${model} failed (${String(err)}), falling back to flash`);
      raw = await runWithModel("gemini-2.5-flash");
      usedModel = "gemini-2.5-flash";
    } else {
      throw err;
    }
  }

  const regions = cleanTextRegions(raw, imageWidth, imageHeight, options?.excludeTexts).map((r) => ({
    ...r,
    panelId: options?.panelId,
  }));

  return {
    manifest: {
      imageWidth,
      imageHeight,
      regions,
      model: usedModel,
      extractedAt: Date.now(),
      manifestVersion: TEXT_MANIFEST_VERSION,
    },
    model: usedModel,
  };
}
