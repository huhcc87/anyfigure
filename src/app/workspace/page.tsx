"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import AppSidebar from "@/components/layout/AppSidebar";
import EditorTopbar from "@/components/editor/EditorTopbar";
import LeftSidebar, { type SidebarPanel } from "@/components/editor/LeftSidebar";
import RightSidebar, { type RightTab } from "@/components/editor/RightSidebar";
import type { BiomedicalAsset } from "@/types/biomedicalAssets";
import type { PathwayTemplate } from "@/data/biomedicalPathwayTemplates";
import { createBiomedicalCanvasElement } from "@/utils/createBiomedicalCanvasElement";
import { getAssetById } from "@/data/biomedicalAssets";
import { useEditorStore } from "@/store/editorStore";
import { loadPlanForWorkspace, clearSessionPlanOnly, cacheEditPlan } from "@/lib/figureStore";
import type { ChartData } from "@/types";

const InfiniteCanvas = dynamic(() => import("@/components/canvas/InfiniteCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#e8eaed]">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
    </div>
  ),
});

const BiomedicalAssetsPanel = dynamic(() => import("@/components/biomedical/BiomedicalAssetsPanel"), { ssr: false });

type ExportFormat = "png" | "jpg" | "svg" | "pdf" | "pptx";

const CHART_PRESETS: { name: string; data: ChartData }[] = [
  {
    name: "Bar Chart",
    data: { type: "bar", labels: ["A", "B", "C", "D"], datasets: [{ label: "Expression", data: [4, 7, 3, 9], color: "#6366f1" }] },
  },
  {
    name: "Line Chart",
    data: { type: "line", labels: ["0h", "6h", "12h", "24h"], datasets: [{ label: "Growth", data: [1, 3, 5, 8], color: "#06B6D4" }] },
  },
  {
    name: "Scatter",
    data: { type: "scatter", labels: ["s1", "s2", "s3", "s4"], datasets: [{ label: "Samples", data: [2, 5, 4, 7], color: "#10B981" }] },
  },
  {
    name: "Pie Chart",
    data: { type: "pie", labels: ["WT", "KO", "Rescue"], datasets: [{ label: "Genotype", data: [45, 35, 20], color: "#8B5CF6" }] },
  },
  {
    name: "Heatmap",
    data: { type: "heatmap", labels: ["G1", "G2", "G3"], datasets: [{ label: "Intensity", data: [0.2, 0.8, 0.5], color: "#F59E0B" }] },
  },
  {
    name: "Volcano Plot",
    data: { type: "scatter", labels: ["DE genes"], datasets: [{ label: "Volcano", data: [3, 6, 2, 8, 5], color: "#EF4444" }] },
  },
  {
    name: "Box Plot",
    data: { type: "bar", labels: ["Ctrl", "Treat"], datasets: [{ label: "Distribution", data: [5, 8], color: "#6366f1" }] },
  },
  {
    name: "Kaplan-Meier",
    data: { type: "line", labels: ["0", "12", "24", "36"], datasets: [{ label: "Survival", data: [100, 80, 60, 45], color: "#EC4899" }] },
  },
];

export default function WorkspacePage() {
  const [activePanel, setActivePanel] = useState<SidebarPanel>(null);
  const [rightTab, setRightTab] = useState<RightTab>("layers");
  const [showAIModal, setShowAIModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportDpi, setExportDpi] = useState<72 | 150 | 300>(300);
  const [exportTransparent, setExportTransparent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const {
    addElement,
    canvasWidth,
    canvasHeight,
    loadFromFigurePlan,
    loadFromSceneGraph,
    elements,
  } = useEditorStore();
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingScene, setGeneratingScene] = useState(false);
  /** Figure ID of the currently loaded raster figure (set when a FigurePlan
   *  with images is loaded). Needed to call /api/figures/[id]/make-editable. */
  const [loadedFigureId, setLoadedFigureId] = useState<string | null>(null);
  /** True if the loaded plan has imageUrl panels but no detected labels yet —
   *  shows the "Make Text Editable" button so the user can trigger OCR. */
  const [needsTextExtraction, setNeedsTextExtraction] = useState(false);
  const [extractingText, setExtractingText] = useState(false);

  const handleGenerateScene = useCallback(async () => {
    const prompt = aiPrompt.trim();
    if (!prompt) {
      toast.error("Type a research prompt first");
      return;
    }
    setGeneratingScene(true);
    try {
      toast.info("Generating editable scene graph…");
      const res = await fetch("/api/ai/generate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, numPanels: 2, scientificField: "biomedical" }),
      });
      const data = await res.json();
      if (!res.ok || !data.scene) {
        toast.error(data.error || "Generation failed");
        return;
      }
      loadFromSceneGraph(data.scene);
      const count = (data.scene.elements ?? []).length;
      toast.success(`Generated ${count} editable elements — every one is draggable`);
      setAiPrompt("");
    } catch (err) {
      console.error("[workspace] generate-scene failed:", err);
      toast.error("Generation failed — check console");
    } finally {
      setGeneratingScene(false);
    }
  }, [aiPrompt, loadFromSceneGraph]);

  // Load handoff from Home (vector scene graph) OR Studio (FigurePlan).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        // 1. Prefer the vector-first scene graph if Home just handed one off.
        try {
          const raw = sessionStorage.getItem("anyfigure_pending_scene");
          if (raw) {
            const scene = JSON.parse(raw);
            sessionStorage.removeItem("anyfigure_pending_scene");
            if (scene?.elements?.length) {
              loadFromSceneGraph(scene);
              toast.success(`Loaded ${scene.elements.length} editable vector elements`);
              if (!cancelled) setLoadingPlan(false);
              return;
            }
          }
        } catch {
          /* fall through to plan loader */
        }

        // 2. Otherwise load any cached raster-mode plan from Studio handoff.
        const plan = await loadPlanForWorkspace();
        if (cancelled) return;
        // 2a. The Home page also stores its scene under plan.sceneGraph as a
        //     piggy-back on the same cache. Detect that and route to the
        //     vector loader.
        const planSceneGraph = (plan as unknown as { sceneGraph?: { elements?: unknown[] } })
          ?.sceneGraph;
        if (planSceneGraph?.elements?.length) {
          loadFromSceneGraph(planSceneGraph as never);
          toast.success(`Loaded ${planSceneGraph.elements.length} editable vector elements`);
          clearSessionPlanOnly();
        } else if (plan?.panels?.length) {
          loadFromFigurePlan(plan);
          const labelCount = plan.panels.reduce(
            (n, p) => n + (p.textNodesManifest?.regions?.length ?? 0),
            0
          );
          const hasRasterImage = plan.panels.some((p) => !!p.imageUrl);
          if (labelCount > 0) {
            toast.success(`Loaded ${labelCount} editable labels — click any to edit`);
          } else if (hasRasterImage) {
            // Raster figure with no labels detected yet — surface the
            // "Make Text Editable" button so the user can trigger OCR.
            const figId = (typeof window !== "undefined" && new URL(window.location.href).searchParams.get("figure")) || null;
            setLoadedFigureId(figId);
            setNeedsTextExtraction(true);
            toast.info(`Image loaded — click "Make Text Editable" to extract editable labels`);
          } else {
            toast.success(`Loaded "${plan.title || "figure"}" into the canvas`);
          }
          clearSessionPlanOnly();
        }
      } catch (err) {
        console.error("[workspace] failed to load plan:", err);
        toast.error("Failed to load figure into editor");
      } finally {
        if (!cancelled) setLoadingPlan(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Run vision-OCR on the loaded raster figure, convert detected text regions
   *  into editable CanvasElements, and refresh the layers panel. */
  const handleMakeTextEditable = useCallback(async () => {
    if (extractingText) return;
    setExtractingText(true);
    try {
      toast.info("Detecting text regions with Gemini Vision — 30 to 90 seconds…");
      const plan = await loadPlanForWorkspace();
      if (!plan?.panels?.length) {
        toast.error("No image to extract text from");
        return;
      }
      // Re-use existing /api/ai/extract-text-regions endpoint (it does the OCR
      // + writes the manifest back into the plan). force:true bypasses any
      // empty cached manifest from a prior run.
      const res = await fetch("/api/ai/extract-text-regions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, force: true }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "ok") {
        toast.error(data.error || "Text extraction failed");
        return;
      }
      const enriched = data.plan;
      const labelCount = enriched.panels?.reduce(
        (n: number, p: { textNodesManifest?: { regions?: unknown[] } }) =>
          n + (p.textNodesManifest?.regions?.length ?? 0),
        0
      ) ?? 0;
      // Reload the canvas — this re-runs importFigurePlan which now sees the
      // textNodesManifest and adds every region as an editable text element.
      loadFromFigurePlan(enriched);
      if (loadedFigureId) await cacheEditPlan(loadedFigureId, enriched);
      setNeedsTextExtraction(false);
      toast.success(`Detected ${labelCount} editable labels — double-click any to edit`);
    } catch (err) {
      console.error("[workspace] make-editable failed:", err);
      toast.error("Text extraction failed — check console");
    } finally {
      setExtractingText(false);
    }
  }, [extractingText, loadedFigureId, loadFromFigurePlan]);

  const handleOpenPanel = useCallback((panel: SidebarPanel) => {
    setActivePanel(panel);
    if (panel === "layers") setRightTab("layers");
    if (panel === "ai") setShowAIModal(true);
  }, []);

  const handleInsertAsset = useCallback((asset: BiomedicalAsset) => {
    const el = createBiomedicalCanvasElement(asset, canvasWidth / 2 - 50, canvasHeight / 2 - 50);
    addElement(el);
  }, [addElement, canvasWidth, canvasHeight]);

  const handleInsertPathway = useCallback((template: PathwayTemplate) => {
    template.nodes.forEach((node, i) => {
      const asset = getAssetById(`pathways-${node.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`)
        ?? ({
          id: `pathway-node-${node.id}`,
          name: node.label,
          category: "pathways" as const,
          emoji: node.emoji ?? "⬡",
          tags: ["pathway", template.name],
          assetType: "pathway" as const,
        } satisfies BiomedicalAsset);
      addElement(createBiomedicalCanvasElement(
        asset,
        80 + (i % 4) * 140,
        canvasHeight / 2 - 80 + Math.floor(i / 4) * 100
      ));
    });
  }, [addElement, canvasHeight]);

  const handleInsertChart = useCallback((name: string, chartData: ChartData) => {
    addElement({
      type: "chart",
      x: canvasWidth / 2 - 120,
      y: canvasHeight / 2 - 90,
      width: 240,
      height: 180,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      label: name,
      chartData,
      fill: "#ffffff",
      stroke: "#6366f1",
      strokeWidth: 1.5,
      partRole: "part",
    });
  }, [addElement, canvasWidth, canvasHeight]);

  const handleUploadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      addElement({
        type: "image",
        x: canvasWidth / 2 - 150,
        y: canvasHeight / 2 - 100,
        width: 300,
        height: 200,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        content: dataUrl,
        label: file.name,
        partRole: "reference",
      });
    };
    reader.readAsDataURL(file);
  }, [addElement, canvasWidth, canvasHeight]);

  const handleExport = async (format?: ExportFormat) => {
    const fmt = format || exportFormat;
    const { elements, canvasWidth: w, canvasHeight: h } = useEditorStore.getState();

    if (!elements.length) {
      setExportError("No figure to export. Generate one in AI Studio first.");
      setShowExportModal(true);
      return;
    }

    setIsExporting(true);
    setExportError(null);
    try {
      const scale = exportDpi / 96;
      const {
        exportElementsToPng,
        exportElementsToJpeg,
        exportElementsToPdf,
        exportElementsToPptx,
      } = await import("@/lib/canvasExport");
      const { saveAs } = await import("file-saver");

      if (fmt === "png") {
        const url = await exportElementsToPng(elements, w, h, scale);
        saveAs(url, "anyfigure-export.png");
      } else if (fmt === "jpg") {
        const url = await exportElementsToJpeg(elements, w, h, scale);
        saveAs(url, "anyfigure-export.jpg");
      } else if (fmt === "svg") {
        const png = await exportElementsToPng(elements, w, h, scale);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><image href="${png}" width="${w}" height="${h}"/></svg>`;
        saveAs(new Blob([svg], { type: "image/svg+xml" }), "anyfigure-export.svg");
      } else if (fmt === "pdf") {
        const bytes = await exportElementsToPdf(elements, w, h, scale);
        saveAs(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }), "anyfigure-export.pdf");
      } else if (fmt === "pptx") {
        const blob = await exportElementsToPptx(elements, w, h);
        saveAs(blob, "anyfigure-export.pptx");
      }
      setShowExportModal(false);
    } catch (err) {
      setExportError(`Export failed: ${String(err)}`);
      setShowExportModal(true);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#080C1C] overflow-hidden">
      {/* New unified left rail — same one Home / Projects / Library use */}
      <AppSidebar />

      <div className="flex flex-1 flex-col min-w-0 min-h-0 md:pl-16">
        <EditorTopbar
          onAIGenerate={() => setShowAIModal(true)}
          onExport={() => setShowExportModal(true)}
        />

        <div className="flex flex-1 overflow-hidden min-h-0">
          <LeftSidebar activePanel={activePanel} onOpenPanel={handleOpenPanel} />

          {activePanel === "biomedical" && (
            <BiomedicalAssetsPanel onInsert={handleInsertAsset} onInsertPathway={handleInsertPathway} />
          )}
          {activePanel === "charts" && (
            <div className="w-64 bg-[#0C1120] border-r border-white/10 flex flex-col p-3 overflow-y-auto">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1">Charts</h3>
              <p className="text-[10px] text-zinc-500 mb-3">Click a chart type to insert it on the canvas.</p>
              <div className="grid grid-cols-2 gap-2">
                {CHART_PRESETS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleInsertChart(c.name, c.data)}
                    className="aspect-square rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-indigo-500/30 flex flex-col items-center justify-center gap-1 transition-all"
                    title={`Insert ${c.name}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-indigo-400">
                      <path d="M2 10h8M4 10V6M6 10V4M8 10V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[9px] text-zinc-500 text-center px-0.5">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {activePanel === "uploads" && (
            <div className="w-64 bg-[#0C1120] border-r border-white/10 flex flex-col p-3">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1">Upload Image</h3>
              <p className="text-[10px] text-zinc-500 mb-4">Add PNG, JPG, or SVG files to your figure canvas.</p>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadImage(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="w-full py-3 rounded-xl border border-dashed border-white/20 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-all"
              >
                Choose file…
              </button>
              <p className="text-[10px] text-zinc-600 mt-3 leading-relaxed">
                Uploaded images can be moved and resized with the Select tool (V).
              </p>
            </div>
          )}

          <div className="flex-1 min-w-0 min-h-0 flex flex-col">
            {/* ─── BIG "Make Text Editable" CTA — only shows for raster figures
                that haven't been OCR'd yet. This is the path users were
                missing for Nano Banana Pro figures. ─── */}
            {needsTextExtraction && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-rose-50 border-b border-amber-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h6v6H4zM4 14h6v6H4zM14 14h6v6h-6z" />
                      <path d="M14 4l6 6M14 10l6-6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      Raster image loaded — text isn&apos;t editable yet.
                    </p>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Run Gemini Vision to detect labels and turn them into draggable, editable text.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleMakeTextEditable()}
                  disabled={extractingText}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold cursor-pointer shadow-sm"
                >
                  {extractingText ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Detecting labels…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinejoin="round" />
                      </svg>
                      Make Text Editable
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ─── PROMPT BAR — vector-first generation pipeline ─── */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 mr-1 shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 4l5 5M3 21l7.5-7.5M14 5l5 5" strokeLinecap="round" />
                </svg>
                Vector AI
              </div>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !generatingScene) void handleGenerateScene();
                }}
                placeholder="Describe a figure — e.g. 'CRISPR knockout of METTL3 reduces m6A on MUC4 mRNA in PDAC'"
                className="flex-1 min-w-0 text-sm px-3 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                disabled={generatingScene}
              />
              <button
                type="button"
                onClick={() => void handleGenerateScene()}
                disabled={generatingScene || !aiPrompt.trim()}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold cursor-pointer"
                title="Generate a figure as editable vector primitives (no raster, every element editable)"
              >
                {generatingScene ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Building scene…
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" strokeLinejoin="round" />
                    </svg>
                    Generate Figure
                  </>
                )}
              </button>
              <span className="hidden md:inline text-[10px] text-gray-500 ml-1 shrink-0">
                Prompt → Scene Graph → Vector Primitives → Editable Canvas
              </span>
            </div>

            <InfiniteCanvas />
          </div>

          <RightSidebar
            activeTab={rightTab}
            onTabChange={setRightTab}
            onExport={(fmt) => {
              setExportFormat(fmt);
              void handleExport(fmt);
            }}
          />
        </div>
      </div>

      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAIModal(false)}>
          <div className="relative w-full max-w-lg bg-[#0F1629] border border-white/15 rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">AI Figure Generator</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Create a new figure in AI Studio</p>
              </div>
              <button type="button" onClick={() => setShowAIModal(false)} className="text-zinc-500 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            </div>
            <a href="/ai-figure-studio" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 transition-all">
              ✦ Open AI Figure Studio
            </a>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowExportModal(false); setExportError(null); }}>
          <div className="relative w-full max-w-sm bg-[#0F1629] border border-white/15 rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Export Figure</h2>
              <button type="button" onClick={() => setShowExportModal(false)} className="text-zinc-500 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-2 uppercase tracking-wide font-semibold">Format</label>
                <div className="grid grid-cols-5 gap-2">
                  {(["png", "jpg", "svg", "pdf", "pptx"] as ExportFormat[]).map((f) => (
                    <button key={f} type="button" onClick={() => setExportFormat(f)}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${exportFormat === f ? "bg-indigo-500/20 text-indigo-300 border-2 border-indigo-500/50" : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-2 uppercase tracking-wide font-semibold">Resolution</label>
                <div className="flex gap-2">
                  {([72, 150, 300] as const).map((dpi) => (
                    <button key={dpi} type="button" onClick={() => setExportDpi(dpi)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${exportDpi === dpi ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10"}`}>
                      {dpi} DPI
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExportTransparent(!exportTransparent)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors"
              >
                <span className="text-xs text-zinc-400">Transparent background</span>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${exportTransparent ? "bg-indigo-500" : "bg-white/10"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all ${exportTransparent ? "right-[3px]" : "left-[3px]"}`} />
                </div>
              </button>
              {exportFormat === "pptx" && (
                <p className="text-[11px] text-indigo-300/80 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2">
                  PPTX exports separate text boxes, shapes, and images — editable in PowerPoint.
                </p>
              )}
              {exportError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{exportError}</p>
              )}
              <button
                type="button"
                onClick={() => void handleExport()}
                disabled={isExporting}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Exporting…</>
                ) : (
                  <>Download {exportFormat.toUpperCase()} ({exportDpi} DPI)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
