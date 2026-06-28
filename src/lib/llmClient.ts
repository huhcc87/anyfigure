import { formatApiError } from "@/lib/apiErrors";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  provider: "deepseek" | "openai" | "gemini";
}

type LlmProviderName = ChatCompletionResult["provider"];

interface OpenAiStyleProvider {
  kind: "openai-compatible";
  name: LlmProviderName;
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface GeminiProvider {
  kind: "gemini";
  name: "gemini";
  apiKey: string;
  model: string;
}

type LlmProvider = OpenAiStyleProvider | GeminiProvider;

function getProviders(): LlmProvider[] {
  const providers: LlmProvider[] = [];
  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({
      kind: "openai-compatible",
      name: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
    });
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      kind: "openai-compatible",
      name: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: "https://api.openai.com/v1",
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o",
    });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({
      kind: "gemini",
      name: "gemini",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_TEXT_MODEL || "gemini-2.5-pro",
    });
  }
  return providers;
}

function isRetryableLlmError(status: number, body: string): boolean {
  if (status === 401 || status === 402 || status === 429) return true;
  const lower = body.toLowerCase();
  return (
    lower.includes("insufficient balance") ||
    lower.includes("invalid api key") ||
    lower.includes("incorrect api key") ||
    lower.includes("authentication") ||
    lower.includes("rate limit") ||
    lower.includes("billing") ||
    lower.includes("quota")
  );
}

async function callOpenAiCompatible(
  provider: OpenAiStyleProvider,
  opts: ChatCompletionOptions
): Promise<string> {
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens,
      ...(opts.response_format ? { response_format: opts.response_format } : {}),
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    const failure = new Error(rawText);
    (failure as Error & { status?: number }).status = response.status;
    throw failure;
  }

  // Some providers (DeepSeek) return HTTP 200 with error payload
  const lower = rawText.toLowerCase();
  if (lower.includes("insufficient balance") || lower.includes("invalid_error_error") || lower.includes("unknown_error")) {
    const failure = new Error(rawText);
    (failure as Error & { status?: number }).status = 402;
    throw failure;
  }

  const data = JSON.parse(rawText);
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty LLM response");
  return content;
}

async function callGemini(provider: GeminiProvider, opts: ChatCompletionOptions): Promise<string> {
  const system = opts.messages.find((m) => m.role === "system")?.content;
  const conversation = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": provider.apiKey,
      },
      body: JSON.stringify({
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents: conversation,
        generationConfig: {
          temperature: opts.temperature ?? 0.7,
          maxOutputTokens: opts.max_tokens ?? 8000,
          ...(opts.response_format ? { responseMimeType: "application/json" } : {}),
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    const failure = new Error(err);
    (failure as Error & { status?: number }).status = response.status;
    throw failure;
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text || "")
    .join("")
    .trim();
  if (!content) throw new Error("Empty LLM response");
  return content;
}

/** Call chat completions, falling back across DeepSeek → OpenAI → Gemini on credit/auth/rate errors. */
export async function chatCompletion(opts: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const providers = getProviders();
  if (!providers.length) {
    throw new Error(
      "No API key configured. Add DEEPSEEK_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY to .env.local."
    );
  }

  let lastError = "LLM request failed";

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const hasFallback = i < providers.length - 1;

    try {
      const content =
        provider.kind === "gemini"
          ? await callGemini(provider, opts)
          : await callOpenAiCompatible(provider, opts);

      return { content, model: provider.model, provider: provider.name };
    } catch (err) {
      const status = (err as Error & { status?: number }).status ?? 500;
      const message = err instanceof Error ? err.message : String(err);
      lastError = message;
      if (hasFallback && isRetryableLlmError(status, message)) {
        console.warn(`[llm] ${provider.name} failed (${status}): ${message.slice(0, 200)}, trying fallback`);
        continue;
      }
      console.error(`[llm] ${provider.name} failed (${status}): ${message.slice(0, 300)}`);
      throw new Error(formatApiError(message, "LLM request failed"));
    }
  }

  throw new Error(formatApiError(lastError, "LLM request failed"));
}

export function hasLlmProvider(): boolean {
  return getProviders().length > 0;
}
