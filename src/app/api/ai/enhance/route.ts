import { NextRequest, NextResponse } from "next/server";
import { formatApiError } from "@/lib/apiErrors";
import { chatCompletion, hasLlmProvider } from "@/lib/llmClient";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!hasLlmProvider()) {
    return NextResponse.json({ error: "No API key configured" }, { status: 400 });
  }

  try {
    const { content: enhanced } = await chatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are an expert in scientific figure design and biomedical visualization. Rewrite the user's figure prompt to be more specific, scientifically precise, and visually descriptive for a publication-quality figure. Add context about what panels to include, what data to show, and what journal style to follow. Keep it under 3 sentences.",
        },
        {
          role: "user",
          content: `Enhance this figure prompt: "${prompt}"`,
        },
      ],
      temperature: 0.6,
      max_tokens: 300,
    });

    return NextResponse.json({ enhanced });
  } catch (err) {
    return NextResponse.json(
      { error: formatApiError(err, "Enhancement failed") },
      { status: 500 }
    );
  }
}
