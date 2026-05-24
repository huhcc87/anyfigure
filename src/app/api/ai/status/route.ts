import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    geminiModel: process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview",
    geminiTextModel: process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash",
  });
}
