"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import { useEditorStore } from "@/store/editorStore";
import { SCIENTIFIC_TEMPLATES } from "@/lib/ai/scientificTemplates";
import type { ScientificTemplate } from "@/lib/ai/scientificTemplates";

const InfiniteCanvas = dynamic(() => import("@/components/canvas/InfiniteCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#1a1f2e]">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
    </div>
  ),
});

type ExportFormat = "png" | "svg" | "pptx" | "json";

export default function EditableFigurePage() {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const { elements, canvasWidth, canvasHeight, projectName, loadWorkspaceSnapshot } = useEditorStore();

  const loadTemplate = useCallback((template: ScientificTemplate) => {
    loadWorkspaceSnapshot({
      elements: template.elements,
      layers: [{ id: "layer-default", name: "Layer 1", visible: true, locked: false, elements: template.elements.map((e) => e.id) }],
      canvasWidth: template.canvasWidth,
      canvasHeight: template.canvasHeight,
      projectName: template.name,
    });
    setActiveTemplate(template.id);
    setShowTemplates(false);
    toast.success(`Loaded: ${template.name}`);
  }, [loadWorkspaceSnapshot]);

  const handleExport = async (format: ExportFormat) => {
    const { elements: els, canvasWidth: w, canvasHeight: h } = useEditorStore.getState();
    if (!els.length) {
      toast.error("Nothing to export. Load a template or generate a figure first.");
      return;
    }
    setIsExporting(true);
    try {
      if (format === "pptx") {
        const { exportElementsToPptx } = await import("@/lib/canvasExport");
        const { saveAs } = await import("file-saver");
        const blob = await exportElementsToPptx(els, w, h);
        saveAs(blob, "anyfigure-editable.pptx");
        toast.success("Editable PPTX downloaded — every shape/text is a native PowerPoint object");
      } else if (format === "svg") {
        const { downloadEditableSvg } = await import("@/lib/export/exportSvg");
        downloadEditableSvg(els, w, h, "anyfigure-editable.svg", { title: projectName });
        toast.success("Layered SVG downloaded — open in Illustrator, Inkscape, or Figma");
      } else if (format === "png") {
        const { exportElementsToPng } = await import("@/lib/canvasExport");
        const { saveAs } = await import("file-saver");
        const url = await exportElementsToPng(els, w, h, 2);
        saveAs(url, "anyfigure-preview.png");
        toast.success("PNG preview downloaded (not editable)");
      } else if (format === "json") {
        const { canvasElementsToScene } = await import("@/lib/import/importJson");
        const { downloadSceneJson } = await import("@/lib/export/exportJson");
        const scene = canvasElementsToScene(els, w, h, projectName);
        downloadSceneJson(scene, "anyfigure-project.json");
        toast.success("AnyFigure JSON project saved");
      }
    } catch (err) {
      toast.error(`Export failed: ${String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportJson = async () => {
    try {
      const { importJsonFile, sceneToCanvasElements } = await import("@/lib/import/importJson");
      const scene = await importJsonFile();
      const { elements: els, width, height } = sceneToCanvasElements(scene);
      loadWorkspaceSnapshot({
        elements: els,
        layers: [{ id: "layer-default", name: "Layer 1", visible: true, locked: false, elements: els.map((e) => e.id) }],
        canvasWidth: width,
        canvasHeight: height,
        projectName: scene.title,
      });
      setShowTemplates(false);
      toast.success(`Loaded project: ${scene.title}`);
    } catch (err) {
      toast.error(`Import failed: ${String(err)}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#080C1C] text-white overflow-hidden">
      {/* Topbar */}
      <header className="h-12 bg-[#0F1629] border-b border-white/10 flex items-center px-4 gap-3 flex-shrink-0 z-20">
        <Link href="/" className="flex items-center gap-1.5 mr-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-[10px]">
            A
          </div>
          <span className="hidden sm:inline text-[11px] font-semibold text-white">AnyFigure</span>
        </Link>

        <span className="text-zinc-600 text-xs">|</span>
        <span className="text-xs font-medium text-indigo-300">Editable Figure Builder</span>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Templates
          </button>
          <button
            type="button"
            onClick={handleImportJson}
            className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Import JSON
          </button>
          <span className="text-zinc-700 text-xs">|</span>
          {(["pptx", "svg", "json", "png"] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              disabled={isExporting}
              onClick={() => handleExport(fmt)}
              className={`px-2.5 py-1 text-[11px] rounded border transition-colors disabled:opacity-50 ${
                fmt === "pptx"
                  ? "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white font-semibold"
                  : fmt === "svg"
                  ? "bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-300"
                  : fmt === "json"
                  ? "bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/40 text-amber-300"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
              }`}
              title={
                fmt === "pptx"
                  ? "Download native editable PowerPoint — each label/shape/arrow is a separate PPTX object"
                  : fmt === "svg"
                  ? "Download layered SVG — every object has its own id, editable in Illustrator/Inkscape"
                  : fmt === "json"
                  ? "Save AnyFigure JSON project — reopenable, preserves all objects and metadata"
                  : "Download PNG preview only (not editable)"
              }
            >
              {fmt === "pptx" ? "⬇ Editable PPTX" : fmt === "svg" ? "⬇ SVG" : fmt === "json" ? "⬇ JSON" : "PNG"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Template panel */}
        {showTemplates && (
          <aside className="w-64 bg-[#0C1120] border-r border-white/10 flex flex-col overflow-y-auto flex-shrink-0">
            <div className="px-3 pt-3 pb-1">
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Scientific Templates</h2>
              <p className="text-[10px] text-zinc-500 mt-0.5">Click to load. All elements are editable.</p>
            </div>
            <div className="flex flex-col gap-1 px-2 py-2">
              {SCIENTIFIC_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => loadTemplate(t)}
                  className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                    activeTemplate === t.id
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-200"
                      : "bg-white/3 border-white/8 hover:bg-white/8 hover:border-white/20 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{t.thumbnail}</span>
                    <div>
                      <div className="text-[11px] font-medium">{t.name}</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">{t.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-auto px-3 py-3 border-t border-white/8">
              <p className="text-[9px] text-zinc-600 leading-relaxed">
                <span className="text-indigo-400 font-semibold">PPTX</span> exports each element as a native
                PowerPoint object — text, shapes, and arrows are all editable in PowerPoint.
                <br />
                <span className="text-emerald-400 font-semibold">SVG</span> exports layered vector with separate
                element IDs for Illustrator/Inkscape/Figma.
              </p>
            </div>
          </aside>
        )}

        {/* Canvas */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center">
                <div className="text-4xl mb-3">🎨</div>
                <p className="text-zinc-400 text-sm">Select a template or go to <Link href="/workspace" className="text-indigo-400 pointer-events-auto underline">AI Studio</Link> to generate a figure</p>
              </div>
            </div>
          )}
          <InfiniteCanvas />
        </div>
      </div>
    </div>
  );
}
