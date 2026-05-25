"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import StudioSidebar, { MobileAppNav } from "@/components/studio/StudioSidebar";
import ModelSelector, { STUDIO_MODELS } from "@/components/studio/ModelSelector";
import AspectRatioSelector, { toGeminiAspectRatio, type AspectRatioId } from "@/components/studio/AspectRatioSelector";
import StyleSelector, { stylePromptSuffix, type VisualStyleId } from "@/components/studio/StyleSelector";
import InputModeTabs, { FigureKindTabs, ImageUploadButton, SuggestMenu, type InputMode } from "@/components/studio/InputModeTabs";
import type { FigureType, ScientificField } from "@/types";
import {
  savePlanForWorkspace,
  cacheEditPlan,
  loadRecentFigures,
  saveRecentFigures,
  removeRecentFigure,
  MAX_RECENT_FIGURES,
  RETENTION_DAYS,
  pruneRecentFigures,
  hydrateStoredFigures,
  loadFigurePlanIdb,
  type StoredFigure,
} from "@/lib/figureStore";
import type { GenerationMode, FigurePlan, PanelSpec } from "@/components/figures/FigureRenderer";
import GenerationGuidePanel from "@/components/studio/GenerationGuidePanel";
import StudioTipsPanel from "@/components/studio/StudioTipsPanel";
import { CATEGORY_QUICK_PROMPTS } from "@/lib/promptLibrary";
import { FigureViewerCard } from "@/components/figures/FigureViewerCard";
import { buildEditableRecordAsync } from "@/lib/makeEditable/persistEditableAssets";

const CATEGORIES = [
  "Biology", "Medicine", "Chemistry", "Immunology", "Genomics",
  "Cancer", "Neuroscience", "Protocols", "Pathways", "Cell Biology",
] as const;

const CATEGORY_FIELDS: Record<string, ScientificField> = {
  Biology: "cell-biology", Medicine: "drug-discovery", Chemistry: "biochemistry",
  Immunology: "immunology", Genomics: "genomics", Cancer: "cancer-biology",
  Neuroscience: "neuroscience", Protocols: "biochemistry", Pathways: "biochemistry",
  "Cell Biology": "cell-biology",
};

const PLACEHOLDERS: Record<InputMode, string> = {
  enhance: "Describe the mechanism, pathway, or experiment you want illustrated…",
  sketch: "Explain what your sketch shows and how it should look when finished…",
  ref: "Describe the new figure you need — we'll follow your reference figure's visual style…",
};

interface GeneratedFigure extends StoredFigure {
  isEnrichingPanels?: boolean;
  enrichProgress?: string;
}

interface ApiStatus {
  deepseek: boolean;
  gemini: boolean;
  openai: boolean;
  geminiModel: string;
}

interface EnrichOptions {
  field: ScientificField;
  aspectRatio: AspectRatioId;
  style: VisualStyleId;
  referenceImage: string | null;
  inputMode: InputMode;
}

async function fetchPanelEnrichment(
  endpoint: string,
  panel: PanelSpec,
  opts: EnrichOptions,
  index: number,
  timeoutMs = 90000
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: panel.label,
        description: panel.description,
        dataContext: panel.dataContext,
        chartType: panel.chartType,
        scientificField: opts.field,
        color: panel.color,
        panelIndex: index,
        aspectRatio: toGeminiAspectRatio(opts.aspectRatio),
        style: stylePromptSuffix(opts.style),
        referenceImage: opts.referenceImage,
        inputMode: opts.inputMode,
      }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    const msg = err instanceof Error && err.name === "AbortError"
      ? "Timed out — try again or use Smart Hybrid"
      : String(err);
    return { ok: false, data: { error: msg } };
  } finally {
    clearTimeout(timer);
  }
}

function applyEnrichment(panel: PanelSpec, mode: GenerationMode, data: Record<string, unknown>): PanelSpec {
  if (mode === "svg" && (data.svg || data.elements)) {
    return {
      ...panel,
      svgContent: data.svg as string,
      assemblyElements: data.elements as PanelSpec["assemblyElements"],
      assemblyTitle: data.title as string,
    };
  }
  if (mode === "image" && data.url) {
    return { ...panel, imageUrl: data.url as string };
  }
  if (mode === "assembly" && data.elements) {
    return {
      ...panel,
      assemblyElements: data.elements as PanelSpec["assemblyElements"],
      assemblyTitle: data.title as string,
    };
  }
  return panel;
}

export default function AIFigureStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<GenerationMode>("smart");
  const [figureKind, setFigureKind] = useState<"illustration" | "charts">("illustration");
  const [field, setField] = useState<ScientificField>("cancer-biology");
  const [numPanels, setNumPanels] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("auto");
  const [visualStyle, setVisualStyle] = useState<VisualStyleId>("flat");
  const [inputMode, setInputMode] = useState<InputMode>("enhance");
  const [uploadedImage, setUploadedImage] = useState<{ dataUrl: string; name: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFigures, setGeneratedFigures] = useState<GeneratedFigure[]>([]);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const activeMode: GenerationMode = figureKind === "charts" ? "charts" : mode;

  useEffect(() => {
    const refreshFigures = async () => {
      const stored = loadRecentFigures();
      const hydrated = await hydrateStoredFigures(stored);
      setGeneratedFigures(hydrated);
    };
    void refreshFigures();
    fetch("/api/ai/status").then((r) => r.json()).then(setApiStatus).catch(() => null);

    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshFigures();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    if (mode === "image" && numPanels > 2) setNumPanels(2);
  }, [mode, numPanels]);

  const patchFigure = useCallback((figId: string, updater: (fig: GeneratedFigure) => GeneratedFigure) => {
    setGeneratedFigures((prev) => {
      const next = prev.map((f) => (f.id === figId ? updater(f) : f));
      const prunedStored = pruneRecentFigures(
        next.map(({ isEnrichingPanels, enrichProgress, ...rest }) => rest)
      );
      void (async () => {
        await saveRecentFigures(prunedStored);
        const updated = prunedStored.find((f) => f.id === figId);
        if (updated?.plan) await cacheEditPlan(updated.id, updated.plan);
      })();
      const byId = new Map(next.map((f) => [f.id, f]));
      return prunedStored.map((s) => byId.get(s.id)!);
    });
  }, []);

  const buildEditableForFigure = useCallback(async (figId: string, plan: FigurePlan) => {
    try {
      const pngUrl = plan.panels?.find((p) => p.imageUrl)?.imageUrl;
      const { record: rec, plan: enriched, labelCount } = await buildEditableRecordAsync(figId, plan, pngUrl);
      await cacheEditPlan(figId, enriched);
      patchFigure(figId, (f) => ({
        ...f,
        plan: enriched,
        editableReady: true,
        svgUrl: rec.svgDataUrl,
        textNodesUrl: rec.textNodesUrl,
        pngUrl,
        prompt: (enriched.title || f.prompt).slice(0, 80),
      }));
      if (labelCount > 0) {
        console.info(`[editable] detected ${labelCount} labels for ${figId}`);
      }
    } catch (err) {
      console.error("[editable] build failed:", err);
      const { buildEditableRecordSync } = await import("@/lib/makeEditable/persistEditableAssets");
      try {
        const pngUrl = plan.panels?.find((p) => p.imageUrl)?.imageUrl;
        const rec = buildEditableRecordSync(figId, plan, pngUrl);
        patchFigure(figId, (f) => ({
          ...f,
          editableReady: true,
          svgUrl: rec.svgDataUrl,
          textNodesUrl: rec.textNodesUrl,
          pngUrl,
        }));
      } catch { /* fallback also failed */ }
    }
  }, [patchFigure]);

  const enrichPanels = async (
    figId: string,
    panels: PanelSpec[],
    currentMode: GenerationMode,
    opts: EnrichOptions
  ) => {
    const endpoints: Partial<Record<GenerationMode, string>> = {
      svg: "/api/ai/svg-panel",
      image: "/api/ai/generate-image",
      assembly: "/api/ai/assemble-panel",
    };
    const endpoint = endpoints[currentMode];
    if (!endpoint) {
      patchFigure(figId, (f) => ({ ...f, isEnrichingPanels: false, enrichProgress: undefined }));
      return;
    }

    const isImage = currentMode === "image";

    try {
      if (isImage) {
        // Instant white-background schematic preview while Gemini runs
        patchFigure(figId, (f) => ({
          ...f,
          enrichProgress: "Building preview…",
        }));
        const previewResults = await Promise.all(
          panels.map((panel, i) => fetchPanelEnrichment("/api/ai/assemble-panel", panel, opts, i, 15000))
        );
        patchFigure(figId, (f) => {
          if (!f.plan?.panels) return f;
          return {
            ...f,
            plan: {
              ...f.plan,
              panels: f.plan.panels.map((p, idx) =>
                previewResults[idx]?.ok
                  ? applyEnrichment(p, "assembly", previewResults[idx].data)
                  : p
              ),
            },
          };
        });

        // Generate AI images one panel at a time (avoids rate limits + state races)
        for (let i = 0; i < panels.length; i++) {
          const panel = panels[i];
          patchFigure(figId, (f) => ({
            ...f,
            enrichProgress: `Gemini: generating panel ${panel.label} (${i + 1}/${panels.length})…`,
          }));

          const result = await fetchPanelEnrichment(endpoint, panel, opts, i, 200000);
          if (result.ok && result.data.url) {
            patchFigure(figId, (f) => {
              if (!f.plan?.panels) return f;
              return {
                ...f,
                plan: {
                  ...f.plan,
                  panels: f.plan.panels.map((p, idx) =>
                    idx === i ? { ...p, imageUrl: result.data.url as string } : p
                  ),
                },
              };
            });
          } else {
            const errMsg = (result.data?.error as string) || "Image generation failed";
            patchFigure(figId, (f) => ({
              ...f,
              enrichProgress: `Panel ${panel.label}: ${errMsg}`,
            }));
            setGenerateError(`Panel ${panel.label}: ${errMsg}`);
          }
        }
      } else {
        const results = await Promise.all(
          panels.map((panel, i) => fetchPanelEnrichment(endpoint, panel, opts, i))
        );
        const enrichedPanels = panels.map((panel, i) =>
          results[i].ok ? applyEnrichment(panel, currentMode, results[i].data) : panel
        );
        patchFigure(figId, (f) => ({
          ...f,
          plan: f.plan ? { ...f.plan, panels: enrichedPanels, mode: currentMode } : f.plan,
        }));
      }
    } catch (err) {
      setGenerateError(`Panel generation failed: ${String(err)}`);
    } finally {
      let latestPlan: FigurePlan | undefined;
      patchFigure(figId, (f) => {
        latestPlan = f.plan ?? undefined;
        return { ...f, isEnrichingPanels: false, enrichProgress: undefined };
      });
      if (latestPlan?.panels?.length) {
        void buildEditableForFigure(figId, latestPlan);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if ((inputMode === "sketch" || inputMode === "ref") && !uploadedImage) {
      setGenerateError("Upload an image first for Sketch / Ref Figure mode.");
      return;
    }

    if (activeMode === "image" && !apiStatus?.gemini && !apiStatus?.openai) {
      setGenerateError("Add GEMINI_API_KEY to .env.local for image generation.");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    const enrichOpts: EnrichOptions = {
      field,
      aspectRatio,
      style: visualStyle,
      referenceImage: uploadedImage?.dataUrl ?? null,
      inputMode,
    };

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          figureType: (figureKind === "charts" ? "data-visualization" : "pathway-diagram") as FigureType,
          scientificField: field,
          journalStyle: "nature",
          numPanels: activeMode === "image" ? Math.min(numPanels, 2) : numPanels,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error || "Generation failed");
        return;
      }

      const figId = `fig-${Date.now()}`;
      const needsEnrich = activeMode !== "charts" && activeMode !== "smart";
      const displayMode: GenerationMode = activeMode;

      const plan: FigurePlan = {
        ...data.plan,
        mode: displayMode,
        panels: (data.plan.panels || []).slice(0, activeMode === "image" ? Math.min(numPanels, 2) : numPanels),
      };

      const newFigure: GeneratedFigure = {
        id: figId,
        prompt: (plan.title || prompt).slice(0, 80),
        panels: plan.panels?.length || numPanels,
        mode: activeMode,
        timestamp: new Date().toISOString(),
        plan,
        isEnrichingPanels: needsEnrich,
        enrichProgress: activeMode === "image" ? "Showing preview — upgrading with Gemini…" : "Generating panels…",
      };

      setGeneratedFigures((prev) => {
        const prunedStored = pruneRecentFigures(
          [{ ...newFigure, isEnrichingPanels: undefined, enrichProgress: undefined }, ...prev].map(
            ({ isEnrichingPanels, enrichProgress, ...rest }) => rest
          )
        );
        void (async () => {
          await saveRecentFigures(prunedStored);
          if (plan.panels?.length) await cacheEditPlan(figId, plan);
        })();
        const byId = new Map([newFigure, ...prev].map((f) => [f.id, f]));
        return prunedStored.map((s) => byId.get(s.id)!);
      });

      setIsGenerating(false);

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

      if (!needsEnrich && plan.panels?.length) {
        void buildEditableForFigure(figId, plan);
      }

      if (needsEnrich && plan.panels?.length) {
        void enrichPanels(figId, plan.panels, activeMode, enrichOpts);
      }
    } catch {
      setGenerateError("Network error — is the dev server running?");
      setIsGenerating(false);
    }
  };

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setPrompt(CATEGORY_QUICK_PROMPTS[cat] || `Create a ${cat.toLowerCase()} figure showing `);
    if (CATEGORY_FIELDS[cat]) setField(CATEGORY_FIELDS[cat]);
    if (cat === "Genomics" || cat === "Protocols") setFigureKind("charts");
    else setFigureKind("illustration");
  };

  const handleOpenInStudio = async (fig: GeneratedFigure) => {
    if (!fig.plan) return;
    if (fig.isEnrichingPanels) {
      setGenerateError("Wait for AI images to finish generating before opening in Studio.");
      return;
    }
    let plan = fig.plan;
    if (fig.mode === "image" && plan.panels?.some((p) => !p.imageUrl)) {
      setGenerateError("AI images are still loading. Wait until the figure appears, then try again.");
      return;
    }
    if (plan.panels?.some((p) => !p.imageUrl)) {
      const fromIdb = await loadFigurePlanIdb(fig.id);
      if (fromIdb) plan = fromIdb;
    }
    await cacheEditPlan(fig.id, plan);
    window.location.href = "/workspace";
  };

  const canOpenInStudio = (fig: GeneratedFigure) => {
    if (!fig.plan?.panels?.length) return false;
    if (fig.isEnrichingPanels) return false;
    if (fig.mode === "image") return fig.plan.panels.every((p) => !!p.imageUrl);
    return true;
  };

  const handleDelete = (id: string) => {
    removeRecentFigure(id);
    setGeneratedFigures((prev) => prev.filter((f) => f.id !== id));
  };

  const handleExportPng = async (figId: string) => {
    const fig = generatedFigures.find((f) => f.id === figId);
    if (!fig?.plan?.panels?.length) return;
    try {
      const hasAppliedEdits = fig.plan.panels.some((p) =>
        p.textNodesManifest?.regions.some((r) => r.userEdited)
      );
      const domEl = document.getElementById(`figure-export-${figId}`);
      if (hasAppliedEdits && domEl) {
        const { exportFigureDomToPng } = await import("@/lib/exportFigureDom");
        const dataUrl = await exportFigureDomToPng(domEl, 2);
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `anyfigure-${figId}.png`;
        a.click();
        return;
      }

      const { importFigurePlan } = await import("@/lib/planToEditor");
      const { exportElementsToPng } = await import("@/lib/canvasExport");
      const { elements, canvasWidth, canvasHeight } = importFigurePlan(fig.plan);
      const dataUrl = await exportElementsToPng(elements, canvasWidth, canvasHeight, 2);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `anyfigure-${figId}.png`;
      a.click();
    } catch {
      setGenerateError("Export failed");
    }
  };

  const handleExportPptx = async (figId: string) => {
    const fig = generatedFigures.find((f) => f.id === figId);
    if (!fig?.plan?.panels?.length) return;
    try {
      const { importFigurePlan } = await import("@/lib/planToEditor");
      const { exportElementsToPptx } = await import("@/lib/canvasExport");
      const { saveAs } = await import("file-saver");
      const { elements, canvasWidth, canvasHeight } = importFigurePlan(fig.plan);
      const blob = await exportElementsToPptx(elements, canvasWidth, canvasHeight);
      saveAs(blob, `anyfigure-${figId}.pptx`);
    } catch {
      setGenerateError("PPT export failed");
    }
  };

  const panelOptions = activeMode === "image" ? [1, 2] : [1, 2, 3, 4, 5, 6];
  const showUpload = inputMode === "sketch" || inputMode === "ref";

  return (
    <div className="flex h-screen bg-[#eef2f7] overflow-hidden flex-col md:flex-row">
      <StudioSidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <MobileAppNav />
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-sm flex items-center justify-between px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-700">AnyFigure · V1</p>
            <h1 className="text-sm font-semibold text-black">AI Figure Studio</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="text-xs font-medium text-teal-700 hover:text-teal-600 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/60 hover:bg-teal-50 transition-colors cursor-pointer"
          >
            Generation guide
          </button>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="w-full px-5 sm:px-8 py-6 lg:py-8 flex justify-center">
            <div className="space-y-5 w-full lg:w-[75%] min-w-0">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-700">Create</p>
                  <h2 className="font-display text-2xl sm:text-[1.75rem] font-semibold text-black tracking-tight leading-tight">
                    From hypothesis to figure
                  </h2>
                  <p className="text-gray-800 text-sm leading-relaxed max-w-2xl">
                    Draft mechanisms, pathways, and data plots — then refine every label in the workspace editor.
                  </p>
                </div>

                <div className="w-full border border-slate-300 rounded-lg overflow-hidden bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50">
                    <FigureKindTabs
                      value={figureKind}
                      onChange={(kind) => {
                        setFigureKind(kind);
                        if (kind === "charts") setMode("charts");
                      }}
                    />
                    <span className="text-[11px] text-gray-700 hidden sm:inline">
                      {figureKind === "illustration" ? "Mechanisms · pathways · cell biology" : "Bar, line, scatter, and more"}
                    </span>
                  </div>
                  <InputModeTabs value={inputMode} onChange={setInputMode} />

                  {showUpload && (
                    <div className="mx-5 mt-4 flex items-center gap-3 p-3 rounded-md border border-dashed border-teal-300 bg-teal-50/40">
                      <ImageUploadButton
                        image={uploadedImage}
                        onImage={setUploadedImage}
                        label={inputMode === "sketch" ? "Upload sketch" : "Upload reference"}
                      />
                      <p className="text-xs text-black font-medium">
                        {inputMode === "sketch"
                          ? "Attach your hand-drawn draft — we'll vectorize and polish it"
                          : "Attach a reference figure — output will follow its color and layout style"}
                      </p>
                    </div>
                  )}

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={PLACEHOLDERS[inputMode]}
                    className="w-full px-5 py-5 text-sm text-black placeholder:text-gray-500 outline-none resize-y min-h-[200px] leading-relaxed"
                    rows={6}
                    disabled={isGenerating}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
                    }}
                  />

                  <div className="flex flex-wrap items-center justify-between px-5 py-3 border-t border-slate-200 bg-white gap-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <SuggestMenu onSelect={setPrompt} />
                      {!showUpload && (
                        <ImageUploadButton image={uploadedImage} onImage={setUploadedImage} label="Attach image" />
                      )}
                      <select
                        value={numPanels}
                        onChange={(e) => setNumPanels(Number(e.target.value))}
                        disabled={isGenerating}
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-black outline-none cursor-pointer"
                      >
                        {panelOptions.map((n) => (
                          <option key={n} value={n}>{n} panel{n > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <StyleSelector value={visualStyle} onChange={setVisualStyle} />
                      <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                      {figureKind === "illustration" && (
                        <ModelSelector value={mode} onChange={setMode} apiStatus={apiStatus ?? undefined} />
                      )}
                      <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        title="Create figure (⌘+Enter)"
                        className="h-9 px-5 flex-shrink-0 rounded-md bg-slate-900 text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        {isGenerating ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Create figure
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M8 12V4M8 4L5 7M8 4L11 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {mode === "image" && (
                  <p className="text-[11px] text-gray-800">
                    Gemini mode: instant preview first, then AI images replace panels (~60s each). Smart Hybrid is fastest.
                  </p>
                )}

                {generateError && (
                  <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    {generateError}
                    <button onClick={() => setGenerateError(null)} className="ml-2 text-red-400 hover:text-red-600 cursor-pointer">✕</button>
                  </div>
                )}

                <StudioTipsPanel onOpenGuide={() => setShowGuide(true)} />

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-800 mb-3">Discipline</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          activeCategory === cat
                            ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                            : "bg-white border-slate-200 text-gray-900 hover:border-teal-300 hover:text-teal-800"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={resultsRef}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-4">
                    <h2 className="font-display text-lg font-semibold text-black">Your figures</h2>
                    <span className="text-xs text-gray-700">
                      {generatedFigures.length > 0
                        ? `${generatedFigures.length} of ${MAX_RECENT_FIGURES} saved · auto-removed after ${RETENTION_DAYS} days`
                        : `Up to ${MAX_RECENT_FIGURES} figures kept for ${RETENTION_DAYS} days`}
                    </span>
                  </div>

                  {generatedFigures.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="4" y="4" width="16" height="16" rx="2" />
                          <path d="M8 12h8M12 8v8" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-800">Generate a figure above to see your work here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {generatedFigures.map((fig) =>
                        fig.plan?.panels?.length ? (
                          <FigureViewerCard
                            key={fig.id}
                            figureId={fig.id}
                            prompt={fig.prompt}
                            panels={fig.panels}
                            mode={fig.mode}
                            timestamp={fig.timestamp}
                            plan={fig.plan}
                            editableReady={fig.editableReady}
                            isEnriching={fig.isEnrichingPanels}
                            enrichProgress={fig.enrichProgress}
                            onExportPng={() => handleExportPng(fig.id)}
                            onExportPptx={() => handleExportPptx(fig.id)}
                            onDelete={() => handleDelete(fig.id)}
                            onOpenInStudio={() => handleOpenInStudio(fig)}
                            canOpenInStudio={canOpenInStudio(fig)}
                            onEditableReady={(urls) =>
                              patchFigure(fig.id, (f) =>
                                f.editableReady ? f : { ...f, ...urls }
                              )
                            }
                            onPlanUpdate={(updated) =>
                              patchFigure(fig.id, (f) => ({
                                ...f,
                                plan: updated,
                                prompt: (updated.title || f.prompt).slice(0, 80),
                              }))
                            }
                          />
                        ) : (
                          <div key={fig.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm p-8 flex justify-center">
                            <div className="w-5 h-5 border-2 border-teal-500/30 border-t-teal-600 rounded-full animate-spin" />
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
            </div>
          </div>
        </main>
      </div>

      <GenerationGuidePanel open={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
