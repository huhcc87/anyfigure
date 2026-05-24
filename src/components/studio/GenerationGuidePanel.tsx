"use client";

import { GENERATION_GUIDE_SECTIONS } from "@/lib/scientificGenerationGuide";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GenerationGuidePanel({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-black">Scientific Generation Guide</h2>
            <p className="text-xs text-gray-800 mt-1">Gemini 3 Pro · publication-ready schematics</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-700 hover:text-black text-xl leading-none">×</button>
        </div>

        {GENERATION_GUIDE_SECTIONS.map((section) => (
          <div key={section.title} className="mb-5">
            <h3 className="text-sm font-semibold text-teal-700 mb-2">{section.title}</h3>
            {"body" in section && (
              <p className="text-sm text-gray-900 leading-relaxed">{section.body}</p>
            )}
            {"items" in section && (
              <dl className="space-y-2">
                {section.items.map(({ term, desc }) => (
                  <div key={term} className="flex gap-2 text-sm">
                    <dt className="font-medium text-black min-w-[120px]">{term}</dt>
                    <dd className="text-gray-900">{desc}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ))}

        <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-900 leading-relaxed">
          <p className="font-semibold text-black mb-1">Example prompt</p>
          <p className="italic">
            Illustrate the PD2/hPaf1–EZH2 bivalent chromatin axis in cancer as a central signaling axis.
            Show H3K4me3 (green) and H3K27me3 (red) epigenetic markers, regulatory edges with arrows and T-bars,
            NORMAL vs OVEREXPRESSION panels, white background.
          </p>
        </div>

        <a
          href="/docs/AnyFigure_Scientific_Generation_Guide.md"
          className="mt-3 mr-4 inline-block text-xs text-teal-600 hover:underline"
        >
          Generation guide →
        </a>
        <a
          href="/docs/Prompt_Library.md"
          className="mt-3 inline-block text-xs text-teal-600 hover:underline"
        >
          Prompt library →
        </a>
      </div>
    </div>
  );
}
