import { NextRequest, NextResponse } from "next/server";
import { generateGeminiImage, parseReferenceImage } from "@/services/ai/geminiImage";

import { buildSchematicImagePrompt } from "@/lib/scientificGenerationGuide";

export const maxDuration = 300;

async function craftImagePrompt(
  label: string,
  description: string,
  dataContext: string,
  chartType: string,
  scientificField: string,
  style?: string,
  inputMode?: string
): Promise<string> {
  const base = buildSchematicImagePrompt({
    label,
    description,
    dataContext,
    scientificField,
    style,
    inputMode,
  });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return base;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Refine this scientific image prompt. Keep signaling axis, regulatory edges, epigenetic markers terminology. Max 700 chars. White background.",
          },
          { role: "user", content: base },
        ],
        temperature: 0.3,
        max_tokens: 250,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const p = data.choices?.[0]?.message?.content?.trim();
      if (p && p.length > 40) return p;
    }
  } catch { /* fallback to base prompt */ } finally {
    clearTimeout(timer);
  }

  return base;
}

export async function POST(req: NextRequest) {
  const {
    label, description, dataContext, chartType, scientificField,
    aspectRatio, style, referenceImage, inputMode,
  } = await req.json();

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    return NextResponse.json(
      { error: "Add GEMINI_API_KEY to .env.local" },
      { status: 400 }
    );
  }

  const imagePrompt = await craftImagePrompt(
    label,
    description,
    dataContext || "",
    chartType || "diagram",
    scientificField || "biomedical",
    style,
    inputMode
  );

  try {
    if (geminiKey) {
      const ref = referenceImage ? parseReferenceImage(referenceImage as string) : undefined;
      const result = await generateGeminiImage(imagePrompt, {
        aspectRatio: aspectRatio || "16:9",
        referenceImage: ref,
      });
      return NextResponse.json({
        url: result.url,
        label,
        provider: "gemini",
        model: result.model,
      });
    }

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1792x1024",
        quality: "hd",
        style: "natural",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "OpenAI failed");
    const url = data.data?.[0]?.url;
    return NextResponse.json({ url, label, provider: "openai" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
