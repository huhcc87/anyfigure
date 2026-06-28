import { describe, it, expect } from "vitest";
import {
  buildFigureSceneUserPrompt,
  extractJsonFromAiResponse,
} from "@/lib/ai/figureScenePrompt";

describe("buildFigureSceneUserPrompt", () => {
  it("includes the user prompt text", () => {
    const p = buildFigureSceneUserPrompt("KRAS signaling pathway");
    expect(p).toContain("KRAS signaling pathway");
  });
  it("requests JSON-only output", () => {
    const p = buildFigureSceneUserPrompt("test");
    expect(p.toLowerCase()).toContain("json");
  });
});

describe("extractJsonFromAiResponse", () => {
  it("strips markdown json fences", () => {
    const raw = "Here is the result:\n```json\n{\"id\":\"abc\"}\n```";
    expect(extractJsonFromAiResponse(raw)).toBe('{"id":"abc"}');
  });
  it("strips plain code fences", () => {
    const raw = "```\n{\"id\":\"x\"}\n```";
    expect(extractJsonFromAiResponse(raw)).toBe('{"id":"x"}');
  });
  it("returns bare JSON unchanged", () => {
    const raw = '{"title":"Fig 1"}';
    expect(extractJsonFromAiResponse(raw)).toBe(raw);
  });
  it("trims leading text before first {", () => {
    const raw = 'Sure! Here you go: {"title":"Fig 2"}';
    expect(extractJsonFromAiResponse(raw)).toBe('{"title":"Fig 2"}');
  });
});
