export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  suggestions: string[];
  figureTypeHint: string;
  fieldHint: string;
}

export async function enhancePrompt(
  prompt: string,
  apiKey?: string
): Promise<EnhancedPrompt> {
  const systemPrompt = `You are an expert in scientific figure design and biomedical visualization.
Enhance scientific figure prompts to be more specific, visually descriptive, and publication-ready.
Return JSON with: enhanced (string), suggestions (string[]), figureTypeHint (string), fieldHint (string).`;

  if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Enhance this figure prompt: "${prompt}"`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });
      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      return { original: prompt, ...result };
    } catch (err) {
      console.error("Prompt enhancer API error:", err);
    }
  }

  return getMockEnhancement(prompt);
}

function getMockEnhancement(prompt: string): EnhancedPrompt {
  return {
    original: prompt,
    enhanced: `${prompt} — showing key molecular components, signaling cascades, and cellular context with publication-quality annotations suitable for a high-impact journal submission`,
    suggestions: [
      "Add quantitative data panels (bar graphs, survival curves)",
      "Include a mechanistic schematic in panel A",
      "Add representative microscopy/western blot images",
      "Include statistical significance indicators",
      "Use Nature/Cell color palette for better reproducibility",
    ],
    figureTypeHint: "pathway-diagram",
    fieldHint: "cancer-biology",
  };
}
