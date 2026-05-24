"use client";

import { DropdownPortal } from "./DropdownPortal";

export const ASPECT_RATIOS = [
  { id: "auto", label: "Auto", w: 24, h: 16 },
  { id: "16:9", label: "16:9", w: 28, h: 16 },
  { id: "1:1", label: "1:1", w: 18, h: 18 },
  { id: "2:3", label: "2:3", w: 14, h: 21 },
  { id: "3:2", label: "3:2", w: 21, h: 14 },
  { id: "3:4", label: "3:4", w: 15, h: 20 },
  { id: "4:3", label: "4:3", w: 20, h: 15 },
  { id: "4:5", label: "4:5", w: 14, h: 18 },
  { id: "5:4", label: "5:4", w: 18, h: 14 },
  { id: "9:16", label: "9:16", w: 12, h: 21 },
  { id: "21:9", label: "21:9", w: 28, h: 12 },
] as const;

export type AspectRatioId = (typeof ASPECT_RATIOS)[number]["id"];

interface AspectRatioSelectorProps {
  value: AspectRatioId;
  onChange: (ratio: AspectRatioId) => void;
}

export default function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  const selected = ASPECT_RATIOS.find((r) => r.id === value) || ASPECT_RATIOS[0];

  return (
    <DropdownPortal
      width={340}
      align="right"
      trigger={({ ref, open, toggle }) => (
        <button
          ref={ref}
          type="button"
          onClick={toggle}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
            open ? "border-teal-400 bg-teal-50 text-teal-700" : "border-gray-200 bg-white text-black hover:bg-gray-50"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="2" y="4" width="12" height="8" rx="1" />
          </svg>
          <span>{selected.label}</span>
        </button>
      )}
    >
      {(close) => (
        <div className="p-3 grid grid-cols-4 gap-2">
          {ASPECT_RATIOS.map((ratio) => {
            const active = value === ratio.id;
            return (
              <button
                key={ratio.id}
                type="button"
                onClick={() => { onChange(ratio.id); close(); }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-colors cursor-pointer ${
                active ? "bg-teal-600 border-teal-600 text-white" : "border-gray-200 hover:bg-gray-50 text-black"
              }`}
            >
              <div
                className={`border-2 rounded-sm ${active ? "border-white" : "border-gray-400"}`}
                style={{ width: ratio.w, height: ratio.h }}
              />
              <span className="text-[10px] font-medium">{ratio.label}</span>
            </button>
            );
          })}
        </div>
      )}
    </DropdownPortal>
  );
}

/** Map UI ratio to Gemini-supported aspect ratios */
export function toGeminiAspectRatio(id: AspectRatioId): string {
  const map: Record<string, string> = {
    auto: "16:9",
    "16:9": "16:9",
    "1:1": "1:1",
    "2:3": "2:3",
    "3:2": "3:2",
    "3:4": "3:4",
    "4:3": "4:3",
    "4:5": "4:5",
    "5:4": "5:4",
    "9:16": "9:16",
    "21:9": "16:9",
  };
  return map[id] || "16:9";
}
