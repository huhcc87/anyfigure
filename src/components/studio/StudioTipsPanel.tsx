"use client";

import { useState } from "react";
import { MAX_RECENT_FIGURES, RETENTION_DAYS } from "@/lib/figureStore";

interface Props {
  onOpenGuide: () => void;
}

const STEPS = [
  { n: 1, title: "Choose input type", desc: "Write a prompt, upload a sketch, or attach a style reference using the tabs above." },
  { n: 2, title: "Configure output", desc: "Pick panel count, visual style, aspect ratio, and generation model." },
  { n: 3, title: "Create figure", desc: `Press Create or ⌘+Enter. Up to ${MAX_RECENT_FIGURES} figures are kept for ${RETENTION_DAYS} days in Your figures.` },
  { n: 4, title: "Edit & export", desc: "Click Open in Studio to edit labels and layout. Export PNG or editable PPT from the workspace." },
];

export default function StudioTipsPanel({ onOpenGuide }: Props) {
  const [quickOpen, setQuickOpen] = useState(true);

  return (
    <aside className="w-full">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setQuickOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-100"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-700">Getting started</p>
            <p className="text-sm font-semibold text-black mt-0.5">Workflow overview</p>
          </div>
          <svg
            className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${quickOpen ? "rotate-180" : ""}`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {quickOpen && (
          <div className="px-4 py-3">
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <div key={step.n} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center">
                  {step.n}
                </span>
                <div>
                  <p className="text-xs font-semibold text-black">{step.title}</p>
                  <p className="text-[11px] text-gray-800 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
            </div>
            <button
              type="button"
              onClick={onOpenGuide}
              className="w-full mt-4 text-xs font-medium text-teal-700 hover:text-teal-600 py-2 rounded-lg border border-teal-200 bg-teal-50/50 hover:bg-teal-50 transition-colors cursor-pointer"
            >
              Open full generation guide →
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
