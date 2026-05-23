export interface LegendOptions {
  title: string;
  panels: string[];
  journalStyle: string;
  statisticalDetails?: string;
  sampleSize?: string;
}

export async function writeLegend(
  options: LegendOptions,
  apiKey?: string
): Promise<string> {
  const prompt = `Write a concise, publication-quality figure legend for a scientific figure with these panels:
Title: ${options.title}
Panels: ${options.panels.join(", ")}
Journal Style: ${options.journalStyle}
${options.statisticalDetails ? `Statistical details: ${options.statisticalDetails}` : ""}
${options.sampleSize ? `Sample size: ${options.sampleSize}` : ""}

Follow ${options.journalStyle} style guidelines. Be concise but comprehensive. Start with a one-sentence title in bold.`;

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
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
        }),
      });
      const data = await response.json();
      return data.choices[0].message.content as string;
    } catch (err) {
      console.error("Legend writer API error:", err);
    }
  }

  return getMockLegend(options);
}

function getMockLegend(options: LegendOptions): string {
  const panelDescriptions = options.panels
    .map((panel, i) => {
      const letter = String.fromCharCode(65 + i);
      return `(${letter}) ${panel}`;
    })
    .join(" ");

  return `**${options.title}.** ${panelDescriptions}. Data are represented as mean ± SEM. Statistical significance was determined using Student's t-test or one-way ANOVA with Tukey's post-hoc test. *p < 0.05, **p < 0.01, ***p < 0.001. n = 3–5 independent experiments unless otherwise stated.`;
}
