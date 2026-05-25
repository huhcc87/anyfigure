const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface GeminiImageResult {
  url: string;
  mimeType: string;
  model: string;
  text?: string;
}

export interface GeminiImageOptions {
  aspectRatio?: string;
  model?: string;
  referenceImage?: { data: string; mimeType: string };
  style?: string;
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
  }>;
  error?: { message?: string };
}

function stripDataUrl(dataUrl: string): { data: string; mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: "image/png", data: dataUrl };
}

export async function generateGeminiImage(
  prompt: string,
  options?: GeminiImageOptions
): Promise<GeminiImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const model = options?.model || process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview";
  const aspectRatio = options?.aspectRatio || "16:9";

  const parts: GeminiPart[] = [];
  if (options?.referenceImage) {
    parts.push({
      inlineData: {
        mimeType: options.referenceImage.mimeType,
        data: options.referenceImage.data,
      },
    });
    parts.push({ text: `Use the uploaded image as reference. ${prompt}` });
  } else {
    parts.push({ text: prompt });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 200000);

  try {
    const res = await fetch(
      `${GEMINI_BASE}/models/${model}:generateContent`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: { aspectRatio },
          },
        }),
      }
    );

    const data = (await res.json()) as GeminiGenerateResponse;

    if (!res.ok) {
      throw new Error(data.error?.message || `Gemini API error (${res.status})`);
    }

    const responseParts = data.candidates?.[0]?.content?.parts || [];
    let text = "";
    let imageData: { mimeType: string; data: string } | null = null;

    for (const part of responseParts) {
      if (part.text) text += part.text;
      if (part.inlineData?.data) {
        imageData = {
          mimeType: part.inlineData.mimeType || "image/png",
          data: part.inlineData.data,
        };
      }
    }

    if (!imageData) {
      throw new Error("Gemini returned no image. Try Smart Hybrid for faster results.");
    }

    return {
      url: `data:${imageData.mimeType};base64,${imageData.data}`,
      mimeType: imageData.mimeType,
      model,
      text: text.trim() || undefined,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function parseReferenceImage(dataUrl: string) {
  return stripDataUrl(dataUrl);
}
