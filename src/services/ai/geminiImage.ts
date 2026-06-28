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

function stripDataUrl(dataUrl: string): { data: string; mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: "image/png", data: dataUrl };
}

async function generateWithImagen(
  prompt: string,
  apiKey: string,
  model: string,
  aspectRatio: string
): Promise<GeminiImageResult> {
  const res = await fetch(
    `${GEMINI_BASE}/models/${model}:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Imagen API error (${res.status})`);

  const prediction = data.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) throw new Error("Imagen returned no image");

  const mimeType = prediction.mimeType || "image/png";
  return {
    url: `data:${mimeType};base64,${prediction.bytesBase64Encoded}`,
    mimeType,
    model,
  };
}

async function generateWithGeminiNative(
  prompt: string,
  apiKey: string,
  model: string
): Promise<GeminiImageResult> {
  const res = await fetch(
    `${GEMINI_BASE}/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini API error (${res.status})`);

  const parts = data.candidates?.[0]?.content?.parts || [];
  let text = "";
  let imageData: { mimeType: string; data: string } | null = null;
  for (const part of parts) {
    if (part.text) text += part.text;
    if (part.inlineData?.data) {
      imageData = { mimeType: part.inlineData.mimeType || "image/png", data: part.inlineData.data };
    }
  }
  if (!imageData) throw new Error("Gemini returned no image");
  return { url: `data:${imageData.mimeType};base64,${imageData.data}`, mimeType: imageData.mimeType, model, text: text.trim() || undefined };
}

export async function generateGeminiImage(
  prompt: string,
  options?: GeminiImageOptions
): Promise<GeminiImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const model = options?.model || process.env.GEMINI_IMAGE_MODEL || "imagen-3.0-generate-002";
  const aspectRatio = options?.aspectRatio || "16:9";

  // Imagen models use predict endpoint; Gemini models use generateContent
  const isImagen = model.startsWith("imagen");

  if (isImagen) {
    return generateWithImagen(prompt, apiKey, model, aspectRatio);
  }
  return generateWithGeminiNative(prompt, apiKey, model);
}

export function parseReferenceImage(dataUrl: string) {
  return stripDataUrl(dataUrl);
}
