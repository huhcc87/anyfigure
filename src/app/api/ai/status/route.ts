import { NextResponse } from "next/server";

import { hasLlmProvider } from "@/lib/llmClient";

export async function GET() {
  return NextResponse.json({
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    llmReady: hasLlmProvider(),
    llmFallback: [
      !!process.env.DEEPSEEK_API_KEY && "deepseek",
      !!process.env.OPENAI_API_KEY && "openai",
      !!process.env.GEMINI_API_KEY && "gemini",
    ].filter(Boolean),
    geminiModel: process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview",
    geminiTextModel: process.env.GEMINI_TEXT_MODEL || "gemini-2.5-pro",
  });
}
