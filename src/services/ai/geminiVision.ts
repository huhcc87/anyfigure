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
        const allNormalized = vals.every((v) => v >= 0 && v <= 1);
        const maybeNormalized = vals[0] <= 1 && vals[1] <= 1 && vals[2] <= 1 && vals[3] <= 1;

        if (allNormalized || maybeNormalized) {
          bbox = [
            Math.round(vals[0] * imageWidth),
            Math.round(vals[1] * imageHeight),
            Math.max(Math.round(vals[2] * imageWidth), 4),
            Math.max(Math.round(vals[3] * imageHeight), 4),
          ];
        } else {
          bbox = sanitizeBbox(
            [
              Math.round(vals[0]),
              Math.round(vals[1]),
              Math.max(Math.round(vals[2]), 4),
              Math.max(Math.round(vals[3]), 4),
            ],
            r.text!.trim(),
            imageWidth,
            imageHeight
          );
        }
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

  const model = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";

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

  const prompt = `You analyze a scientific figure (${imageWidth}×${imageHeight}px) for a text editor overlay.

Return ONLY JSON:
{"regions":[{"text":"Insulin","bbox":[0.052,0.118,0.072,0.022],"confidence":0.93}]}

CRITICAL bbox rules — bbox = [x, y, width, height] ALL normalized 0.0–1.0 relative to the FULL image:
- x,y = top-left corner of the text ink (NOT center, NOT x2/y2 corner coords)
- width = horizontal span of the text (width > height for horizontal labels)
- height = vertical span of ONE line (typically 0.012–0.04)
- Do NOT return [x1,y1,x2,y2] corner pairs

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const res = await fetch(`${GEMINI_BASE}/models/${model}:generateContent`, {
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
          temperature: 0.1,
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
    const raw = parseGeminiRegions(text, imageWidth, imageHeight);
    const regions = cleanTextRegions(raw, imageWidth, imageHeight, options?.excludeTexts).map((r) => ({
      ...r,
      panelId: options?.panelId,
    }));

    return {
      manifest: {
        imageWidth,
        imageHeight,
        regions,
        model,
        extractedAt: Date.now(),
        manifestVersion: TEXT_MANIFEST_VERSION,
      },
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
}
