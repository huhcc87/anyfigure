"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  PROMPT_LIBRARY,
  PROMPT_LIBRARY_INTRO,
  PROMPT_LIBRARY_SECTIONS,
  type LibraryPrompt,
} from "@/lib/promptLibrary";

export type InputMode = "enhance" | "sketch" | "ref";

interface InputModeTabsProps {
  value: InputMode;
  onChange: (mode: InputMode) => void;
}

const TABS: { id: InputMode; label: string; hint: string; icon: React.ReactNode }[] = [
  {
    id: "enhance",
    label: "Write prompt",
    hint: "Describe your figure in plain language",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 13h10M5.5 10.5L11 5l2 2-5.5 5.5H5.5V10.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "sketch",
    label: "From sketch",
    hint: "Upload a hand-drawn draft to refine",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="12" height="10" rx="1.5" />
        <path d="M5 11l3-4 2 2 3-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "ref",
    label: "Style reference",
    hint: "Match the look of an existing figure",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="8" height="8" rx="1" />
        <rect x="7" y="2" width="8" height="8" rx="1" />
      </svg>
    ),
  },
];

export default function InputModeTabs({ value, onChange }: InputModeTabsProps) {
  const active = TABS.find((t) => t.id === value) ?? TABS[0];

  return (
    <div className="px-5 pt-4 pb-0 border-b border-slate-200 bg-gradient-to-b from-slate-50/80 to-white">
      <div className="flex flex-wrap gap-x-1 gap-y-1">
        {TABS.map((tab) => {
          const isActive = value === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              title={tab.hint}
              className={`group flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                isActive
                  ? "border-teal-600 text-black"
                  : "border-transparent text-gray-600 hover:text-black hover:border-slate-300"
              }`}
            >
              <span className={isActive ? "text-teal-600" : "text-gray-500 group-hover:text-teal-600"}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-700 py-2">{active.hint}</p>
    </div>
  );
}

export type FigureKind = "illustration" | "charts";

interface FigureKindTabsProps {
  value: FigureKind;
  onChange: (kind: FigureKind) => void;
}

export function FigureKindTabs({ value, onChange }: FigureKindTabsProps) {
  const kinds: { id: FigureKind; label: string; icon: React.ReactNode }[] = [
    {
      id: "illustration",
      label: "Schematics",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="5" cy="8" r="2.5" />
          <circle cx="11" cy="5" r="2" />
          <path d="M7 7l2-1M9 6.5l1.5 2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "charts",
      label: "Plots & graphs",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M2 13h12M4 13V8M7 13V5M10 13V9M13 13V4" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-0.5 rounded-md border border-slate-300 bg-white">
      {kinds.map((kind) => {
        const isActive = value === kind.id;
        return (
          <button
            key={kind.id}
            type="button"
            onClick={() => onChange(kind.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? "bg-slate-900 text-white"
                : "text-gray-700 hover:bg-slate-100"
            }`}
          >
            {kind.icon}
            {kind.label}
          </button>
        );
      })}
    </div>
  );
}

interface ImageUploadProps {
  image: { dataUrl: string; name: string } | null;
  onImage: (img: { dataUrl: string; name: string } | null) => void;
  label?: string;
}

export function ImageUploadButton({ image, onImage, label = "Upload" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      onImage({ dataUrl: reader.result as string, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title={label}
        className={`p-2 rounded-md transition-colors cursor-pointer ${
          image ? "text-teal-600 bg-teal-50" : "text-gray-700 hover:text-teal-600 hover:bg-teal-50"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.dataUrl} alt="" className="w-7 h-7 rounded object-cover border border-gray-200" />
          <button type="button" onClick={() => onImage(null)} className="text-gray-600 hover:text-red-500 text-xs px-1 cursor-pointer">✕</button>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export const SUGGEST_PROMPTS = PROMPT_LIBRARY.filter((p) => p.category !== "template").map((p) => p.prompt);

interface SuggestMenuProps {
  onSelect: (prompt: string) => void;
}

function PromptRow({ item, onPick }: { item: LibraryPrompt; onPick: (p: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(item.prompt)}
      className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
    >
      <p className="text-xs font-semibold text-black">{item.title}</p>
      <p className="text-[11px] text-gray-800 mt-0.5 line-clamp-2 leading-relaxed">{item.prompt.split("\n")[0]}</p>
    </button>
  );
}

export function SuggestMenu({ onSelect }: SuggestMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const openMenu = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuW = 380;
      const left = Math.min(rect.left, window.innerWidth - menuW - 12);
      setPos({ top: rect.bottom + 8, left: Math.max(12, left) });
    }
    setOpen(true);
  };

  const pick = (s: string) => {
    onSelect(s);
    setOpen(false);
  };

  const menu = open ? (
    <div
      ref={menuRef}
      className="fixed w-[380px] bg-white rounded-xl border border-gray-200 shadow-2xl z-[9999] py-2 max-h-[min(420px,70vh)] overflow-y-auto"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="px-4 pb-2 border-b border-gray-100 mb-1">
        <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide">Prompt Library</p>
        <p className="text-[10px] text-gray-800 mt-1 leading-relaxed">{PROMPT_LIBRARY_INTRO}</p>
      </div>

      {PROMPT_LIBRARY_SECTIONS.map(({ category, label }) => {
        const items = PROMPT_LIBRARY.filter((p) => p.category === category);
        if (!items.length) return null;
        return (
          <div key={category}>
            <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-700 uppercase tracking-wide sticky top-0 bg-white/95 backdrop-blur-sm">
              {label}
            </p>
            {items.map((item) => (
              <PromptRow key={item.id} item={item} onPick={pick} />
            ))}
          </div>
        );
      })}

      <div className="px-4 pt-2 border-t border-gray-100 mt-1">
        <a href="/docs/Prompt_Library.md" target="_blank" rel="noopener noreferrer" className="text-[10px] text-teal-600 hover:underline">
          Full prompt library →
        </a>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        title="Prompt library — suggest prompts"
        className={`p-2 rounded-md transition-colors cursor-pointer ${
          open ? "text-teal-600 bg-teal-50" : "text-gray-700 hover:text-teal-600 hover:bg-teal-50"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" strokeLinecap="round" />
        </svg>
      </button>
      {typeof document !== "undefined" && menu && createPortal(menu, document.body)}
    </>
  );
}
