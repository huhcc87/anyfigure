import type { TextRegionEntry, TextRegionManifest } from "@/types/detectedText";
import { generateId } from "@/lib/utils";
import {
  cleanTextRegions,
  getImageDimensionsFromBase64,
} from "@/lib/makeEditable/imageRegionUtils";

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
        const normalized = vals.every((v) => v >= 0 && v <= 1);
        if (normalized) {
          bbox = [
            Math.round(vals[0] * imageWidth),
            Math.round(vals[1] * imageHeight),
            Math.max(Math.round(vals[2] * imageWidth), 4),
            Math.max(Math.round(vals[3] * imageHeight), 4),
          ];
        } else {
          bbox = [
            Math.round(vals[0]),
            Math.round(vals[1]),
            Math.max(Math.round(vals[2]), 4),
            Math.max(Math.round(vals[3]), 4),
          ];
        }
      } else {
        bbox = [
          Math.round(clamp01(r.x ?? 0) * imageWidth),
          Math.round(clamp01(r.y ?? 0) * imageHeight),
          Math.max(Math.round(clamp01(r.w ?? 0.1, 0.02, 1) * imageWidth), 4),
          Math.max(Math.round(clamp01(r.h ?? 0.03, 0.01, 1) * imageHeight), 4),
        ];
      }
      return {
        id: generateId("r"),
        bbox,
        text: r.text!.trim(),
        confidence: typeof r.confidence === "number" ? r.confidence : 0.88,
      };
    });
}

export interface ExtractFigureTextOptions {
  excludeTexts?: string[];
  panelId?: string;
}

/** Extract text regions from figure image → pixel manifest (FigureLabs-style). */
export async function extractTextFromFigureImage(
  imageUrl: string,
  options?: ExtractFigureTextOptions
): Promise<{ manifest: TextRegionManifest; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const model = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
  const { data, mimeType } = stripDataUrl(imageUrl);
  const { width: imageWidth, height: imageHeight } = getImageDimensionsFromBase64(data, mimeType);

  const prompt = `You are analyzing a scientific figure image (${imageWidth}x${imageHeight}px) for a figure editor.
List EVERY distinct SHORT text label in the diagram area: axis labels, tick labels, gene names, protein complex names, panel letters, arrow labels, and small annotations.

Do NOT include long caption paragraphs or figure legends (multi-sentence blocks).

Return ONLY valid JSON:
{"regions":[{"text":"TSS","bbox":[120,340,42,18],"confidence":0.92}]}

Rules:
- bbox = [x, y, width, height] in PIXELS, origin top-left, relative to full ${imageWidth}x${imageHeight} image
- One entry per distinct text element
- Exact text as shown (preserve capitalization)
- Include small labels (TSS, kb, H3K4me3)
- Skip duplicate entries and long body text`;

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
      },
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
}
