"use client";

import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import type { EditorTool } from "@/types";
import SidebarTooltip from "@/components/editor/SidebarTooltip";

const tools: { id: EditorTool; label: string; description: string; shortcut: string; icon: React.ReactNode }[] = [
  {
    id: "select",
    label: "Select",
    description: "Click elements to select, drag to move, double-click text to edit.",
    shortcut: "Shortcut: V",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2l10 6-5 1.5L6.5 14 3 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "pan",
    label: "Pan",
    description: "Drag the canvas to navigate. Scroll to pan, Ctrl+scroll to zoom.",
    shortcut: "Shortcut: H · Middle-click drag",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v12M2 8h12M5 5l-3 3 3 3M11 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "shape",
    label: "Rectangle",
    description: "Click on the canvas to add a resizable shape box for labels or highlights.",
    shortcut: "Shortcut: R",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: "text",
    label: "Text",
    description: "Click to place a text box. Double-click any text to edit content.",
    shortcut: "Shortcut: T",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M8 4v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "arrow",
    label: "Arrow",
    description: "Click and drag to draw a directional arrow between two points.",
    shortcut: "Shortcut: A",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 13L13 3M13 3H8M13 3v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "pen",
    label: "Pen",
    description: "Click and drag to draw freehand lines and annotations.",
    shortcut: "Shortcut: P",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M11 2l3 3-9 9H2v-3L11 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8.5 4.5l3 3" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
];

export type SidebarPanel =
  | null
  | "layers"
  | "biomedical"
  | "charts"
  | "ai"
  | "uploads";

const panels: { id: Exclude<SidebarPanel, null>; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "layers",
    label: "Layers",
    description: "Show or hide figure layers — title, AI image, legend, markers, and edges.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1.5 6.5L8 3l6.5 3.5L8 10 1.5 6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M1.5 9.5L8 13l6.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "biomedical",
    label: "Biomedical Assets",
    description: "Insert cells, proteins, DNA, organs, and lab icons onto the canvas.",
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
    description: "Add bar, line, scatter, and other data visualization panels.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 13h12M4 13V8M7 13V5M10 13V9M13 13V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "ai",
    label: "AI Tools",
    description: "Generate new figures or get AI suggestions for your layout.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "uploads",
    label: "Upload Image",
    description: "Upload PNG, JPG, or SVG files and place them on the figure canvas.",
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

  const btnClass = (active: boolean) =>
    cn(
      "w-full aspect-square rounded-md flex items-center justify-center transition-colors",
      active ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
    );

  return (
    <aside className="w-12 h-full bg-[#0F1629] border-r border-white/10 flex flex-col items-center py-2 gap-1 flex-shrink-0">
      <div className="flex flex-col gap-0.5 w-full px-1.5">
        {tools.map((t) => (
          <SidebarTooltip key={t.id} label={t.label} description={t.description} shortcut={t.shortcut}>
            <button
              onClick={() => setTool(t.id)}
              aria-label={t.label}
              aria-pressed={tool === t.id}
              className={btnClass(tool === t.id)}
            >
              {t.icon}
            </button>
          </SidebarTooltip>
        ))}
      </div>

      <div className="w-6 h-px bg-white/10 my-1" />

      <div className="flex flex-col gap-0.5 w-full px-1.5">
        {panels.map((p) => (
          <SidebarTooltip key={p.id} label={p.label} description={p.description}>
            <button
              onClick={() => onOpenPanel?.(activePanel === p.id ? null : p.id)}
              aria-label={p.label}
              aria-pressed={activePanel === p.id}
              className={btnClass(activePanel === p.id)}
            >
              {p.icon}
            </button>
          </SidebarTooltip>
        ))}
      </div>
    </aside>
  );
}
