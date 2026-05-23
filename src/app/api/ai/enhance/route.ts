import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  const isDeepSeek = !!process.env.DEEPSEEK_API_KEY;

  const baseUrl = isDeepSeek
    ? "https://api.deepseek.com/v1"
    : "https://api.openai.com/v1";
  const model = isDeepSeek ? "deepseek-chat" : "gpt-4o";

  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 400 });
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
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
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const enhanced = data.choices[0].message.content as string;
    return NextResponse.json({ enhanced });
  } catch (err) {
    return NextResponse.json(
      { error: "Enhancement failed", details: String(err) },
      { status: 500 }
    );
  }
}
