/** Turn raw API / fetch error payloads into short, user-facing messages. */
export function formatApiError(raw: unknown, fallback = "Something went wrong"): string {
  if (raw == null || raw === "") return fallback;

  if (raw instanceof Error) {
    return formatApiError(raw.message, fallback);
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return fallback;
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return formatApiError(JSON.parse(trimmed) as unknown, fallback);
      } catch {
        return humanizeApiMessage(trimmed) ?? trimmed;
      }
    }
    return humanizeApiMessage(trimmed) ?? trimmed;
  }

  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;

    if (obj.error != null) {
      return formatApiError(obj.error, fallback);
    }

    if (typeof obj.message === "string") {
      return humanizeApiMessage(obj.message) ?? obj.message;
    }

    if (typeof obj.details === "string") {
      return formatApiError(obj.details, fallback);
    }
  }

  return fallback;
}

function humanizeApiMessage(message: string): string | null {
  const lower = message.toLowerCase();

  if (lower.includes("insufficient balance")) {
    return "API credits exhausted on all configured providers. Top up DeepSeek or add OPENAI_API_KEY / GEMINI_API_KEY in .env.local.";
  }
  if (lower.includes("incorrect api key") || lower.includes("invalid api key") || lower.includes("authentication")) {
    return "Invalid API key. Check DEEPSEEK_API_KEY or OPENAI_API_KEY in .env.local.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Rate limit reached. Wait a moment and try again.";
  }
  if (lower.includes("gemini_api_key not set") || lower.includes("add gemini_api_key")) {
    return "Image generation needs GEMINI_API_KEY in .env.local.";
  }
  if (lower.includes("no api key configured")) {
    return "No AI API key configured. Add DEEPSEEK_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY to .env.local.";
  }

  return null;
}
