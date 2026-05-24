"use client";

import { DropdownPortal } from "./DropdownPortal";

export const VISUAL_STYLES = [
  { id: "flat", label: "Flat", icon: "▭", desc: "Clean 2D vector, BioRender-style" },
  { id: "2.5d", label: "2.5D", icon: "◧", desc: "Layered depth, soft shadows" },
  { id: "3d", label: "3D", icon: "⬡", desc: "Rendered molecular 3D look" },
  { id: "sketch", label: "Sketch", icon: "✎", desc: "Hand-drawn schematic style" },
] as const;

export type VisualStyleId = (typeof VISUAL_STYLES)[number]["id"];

interface StyleSelectorProps {
  value: VisualStyleId;
  onChange: (style: VisualStyleId) => void;
}

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  const selected = VISUAL_STYLES.find((s) => s.id === value) || VISUAL_STYLES[0];

  return (
    <DropdownPortal
      width={240}
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
          <span>{selected.icon}</span>
          <span>{selected.label}</span>
        </button>
      )}
    >
      {(close) => (
        <div className="py-1">
          {VISUAL_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => { onChange(style.id); close(); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 transition-colors cursor-pointer ${
              value === style.id ? "bg-teal-50" : ""
            }`}
          >
            <span className="text-base w-5 text-center">{style.icon}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">{style.label}</p>
              <p className="text-[10px] text-gray-800">{style.desc}</p>
            </div>
            {value === style.id && (
              <svg width="14" height="14" viewBox="0 0 16 16" className="text-teal-600">
                <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            )}
          </button>
          ))}
        </div>
      )}
    </DropdownPortal>
  );
}

export function stylePromptSuffix(style: VisualStyleId): string {
  const map: Record<VisualStyleId, string> = {
    flat: "Flat 2D vector illustration, clean lines, white background, BioRender aesthetic.",
    "2.5d": "2.5D isometric scientific illustration with soft depth and shadows.",
    "3d": "3D rendered scientific visualization, molecular accuracy, soft lighting.",
    sketch: "Hand-drawn scientific sketch style, pencil lines on white paper.",
  };
  return map[style];
}
