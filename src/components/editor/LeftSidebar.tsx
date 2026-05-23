"use client";

import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import type { EditorTool } from "@/types";
import { useState } from "react";

const tools: { id: EditorTool; label: string; icon: React.ReactNode }[] = [
  {
    id: "select",
    label: "Select (V)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2l10 6-5 1.5L6.5 14 3 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "pan",
    label: "Pan (H)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v12M2 8h12M5 5l-3 3 3 3M11 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "shape",
    label: "Shape (R)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: "text",
    label: "Text (T)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M8 4v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "arrow",
    label: "Arrow (A)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 13L13 3M13 3H8M13 3v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "pen",
    label: "Pen (P)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M11 2l3 3-9 9H2v-3L11 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8.5 4.5l3 3" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
];

type SidebarPanel =
  | null
  | "biomedical"
  | "charts"
  | "templates"
  | "ai"
  | "uploads";

const panels: { id: SidebarPanel; label: string; icon: React.ReactNode }[] = [
  {
    id: "biomedical",
    label: "Biomedical",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5.5 8c0-1.38 1.12-2.5 2.5-2.5S10.5 6.62 10.5 8" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    id: "charts",
    label: "Charts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 13h12M4 13V8M7 13V5M10 13V9M13 13V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "templates",
    label: "Templates",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="8.5" y="2" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="2" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    id: "ai",
    label: "AI Tools",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 10V3M5.5 5.5L8 3l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 11v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

interface LeftSidebarProps {
  onOpenPanel?: (panel: SidebarPanel) => void;
  activePanel?: SidebarPanel;
}

export default function LeftSidebar({ onOpenPanel, activePanel }: LeftSidebarProps) {
  const { tool, setTool } = useEditorStore();

  return (
    <aside className="w-12 h-full bg-[#0F1629] border-r border-white/10 flex flex-col items-center py-2 gap-1 flex-shrink-0">
      {/* Tools */}
      <div className="flex flex-col gap-0.5 w-full px-1.5">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.label}
            className={cn(
              "w-full aspect-square rounded-md flex items-center justify-center transition-colors",
              tool === t.id
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="w-6 h-px bg-white/10 my-1" />

      {/* Panel Toggles */}
      <div className="flex flex-col gap-0.5 w-full px-1.5">
        {panels.map((p) => (
          <button
            key={p.id}
            onClick={() => onOpenPanel?.(activePanel === p.id ? null : p.id)}
            title={p.label}
            className={cn(
              "w-full aspect-square rounded-md flex items-center justify-center transition-colors",
              activePanel === p.id
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
          >
            {p.icon}
          </button>
        ))}
      </div>
    </aside>
  );
}
