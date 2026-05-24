"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { GenerationMode } from "@/components/figures/FigureRenderer";

export interface StudioModel {
  id: GenerationMode;
  name: string;
  provider: string;
  description: string;
  credits: number;
  eta: string;
  icon: string;
  requiresKey?: "gemini" | "openai";
}

export const STUDIO_MODELS: StudioModel[] = [
  {
    id: "smart",
    name: "Smart Hybrid",
    provider: "AnyFigure",
    description: "Instant charts + BioRender schematics. Best for speed & quality.",
    credits: 0,
    eta: "~10s",
    icon: "⚡",
  },
  {
    id: "image",
    name: "Gemini 3 Pro Image",
    provider: "Google",
    description: "AI-generated images. Shows instant preview, then upgrades panels.",
    credits: 50,
    eta: "~60s/panel",
    icon: "✦",
    requiresKey: "gemini",
  },
  {
    id: "assembly",
    name: "Asset Assembly",
    provider: "AnyFigure",
    description: "BioRender-style schematics from curated templates.",
    credits: 0,
    eta: "~5s",
    icon: "🔬",
  },
  {
    id: "svg",
    name: "Illustration",
    provider: "AnyFigure",
    description: "Template pathway and cell diagrams per panel.",
    credits: 0,
    eta: "~5s",
    icon: "🎨",
  },
];

interface ModelSelectorProps {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
  apiStatus?: { gemini?: boolean; openai?: boolean };
}

export default function ModelSelector({ value, onChange, apiStatus }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = STUDIO_MODELS.find((m) => m.id === value) || STUDIO_MODELS[0];

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 320;
    let left = rect.right - menuWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    setMenuPos({ top: rect.bottom + 8, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

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

  const isReady = (model: StudioModel) => {
    if (!model.requiresKey) return true;
    if (model.requiresKey === "gemini") return apiStatus?.gemini ?? false;
    return apiStatus?.openai ?? false;
  };

  const menu = open ? (
    <div
      ref={menuRef}
      className="fixed w-80 bg-white rounded-xl border border-gray-200 shadow-2xl z-[9999] max-h-[min(420px,70vh)] overflow-y-auto"
      style={{ top: menuPos.top, left: menuPos.left }}
    >
      {STUDIO_MODELS.map((model) => {
        const ready = isReady(model);
        const isSelected = value === model.id;
        return (
          <button
            key={model.id}
            type="button"
            onClick={() => { onChange(model.id); setOpen(false); }}
            className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-teal-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer ${
              isSelected ? "bg-teal-50" : ""
            }`}
          >
            <span className="text-lg mt-0.5">{model.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{model.name}</span>
                {model.credits > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">✦ {model.credits}</span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">Free</span>
                )}
                {model.requiresKey && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ready ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {ready ? "Ready" : "Key missing"}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-800 mt-0.5 leading-snug">{model.description}</p>
              <p className="text-[10px] text-gray-700 mt-1">⏱ {model.eta}</p>
            </div>
            {isSelected && (
              <svg width="16" height="16" viewBox="0 0 16 16" className="text-teal-600 flex-shrink-0 mt-1">
                <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { if (!open) updatePosition(); setOpen(!open); }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
          open ? "border-teal-400 bg-teal-50 text-teal-700" : "border-gray-200 bg-white text-black hover:bg-gray-50"
        }`}
      >
        <span>{selected.icon}</span>
        <span className="font-medium hidden sm:inline max-w-[120px] truncate">{selected.name}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className={`text-gray-600 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {typeof document !== "undefined" && menu && createPortal(menu, document.body)}
    </>
  );
}
