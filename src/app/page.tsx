"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import AppSidebar from "@/components/layout/AppSidebar";
import {
  loadRecentFigures,
  recoverFigureListFromIdb,
  pruneRecentFigures,
  saveRecentFigures,
  hydrateStoredFigures,
  removeRecentFigure,
  cacheEditPlan,
  type StoredFigure,
} from "@/lib/figureStore";
import type { SceneGraph } from "@/lib/sceneGraphToCanvas";

const CATEGORIES = [
  { label: "Biology", prompt: "Mechanism of action of " },
  { label: "Medicine", prompt: "Pathway diagram showing " },
  { label: "Chemistry", prompt: "Reaction scheme for " },
  { label: "Genomics", prompt: "Multi-omics integration of " },
  { label: "Immunology", prompt: "Immune signaling cascade for " },
  { label: "Neuroscience", prompt: "Circuit diagram of " },
  { label: "Protocols", prompt: "Stepwise experimental protocol for " },
  { label: "Cell Biology", prompt: "Subcellular localization of " },
];

const SCENE_SESSION_KEY = "anyfigure_pending_scene";

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"illustration" | "flowchart">("illustration");
  const [generating, setGenerating] = useState(false);
  const [recent, setRecent] = useState<StoredFigure[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let list = loadRecentFigures();
      if (list.length === 0) {
        const recovered = await recoverFigureListFromIdb();
        if (recovered.length > 0) list = recovered;
      }
      const hydrated = await hydrateStoredFigures(list);
      if (!cancelled) {
        setRecent(hydrated);
        setLoadingRecent(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    const text = prompt.trim();
    if (!text) {
      toast.error("Describe what you want to draw");
      return;
    }
    setGenerating(true);
    try {
      toast.info("Building vector scene graph…");
      const res = await fetch("/api/ai/generate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          numPanels: 2,
          scientificField: "biomedical",
        }),
      });
      const data = (await res.json()) as { scene?: SceneGraph; error?: string };
      if (!res.ok || !data.scene) {
        toast.error(data.error || "Generation failed");
        return;
      }
      // Hand off the scene to the workspace via sessionStorage. The workspace
      // reads it on mount and pipes it through loadFromSceneGraph().
      try {
        sessionStorage.setItem(SCENE_SESSION_KEY, JSON.stringify(data.scene));
      } catch {
        toast.warning("Browser storage is full — scene may not persist");
      }
      // Also record this as a "figure" so it shows up in Recent.
      const id = `vec-${Date.now()}`;
      const fig: StoredFigure = {
        id,
        prompt: text.slice(0, 120),
        panels: data.scene.elements?.length ?? 0,
        mode: "vector",
        timestamp: new Date().toISOString(),
        editableReady: true,
      };
      const updated = pruneRecentFigures([fig, ...recent]);
      await saveRecentFigures(updated);
      // Cache the "plan" with the scene embedded under a custom key the
      // workspace recognises. We piggy-back on cacheEditPlan to use the same
      // IDB handoff infrastructure.
      void cacheEditPlan(id, {
        title: text.slice(0, 80),
        panels: [],
        // @ts-expect-error — non-standard scene field used by workspace loader
        sceneGraph: data.scene,
      });
      router.push(`/workspace?scene=${encodeURIComponent(id)}`);
    } catch (err) {
      console.error("[home] generate failed:", err);
      toast.error("Generation failed — check console");
    } finally {
      setGenerating(false);
    }
  }, [prompt, recent, router]);

  const handleDelete = useCallback((id: string) => {
    removeRecentFigure(id);
    setRecent((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const examplePrompts = useMemo(
    () => [
      "CRISPR knockout of METTL3 reduces m6A marks on MUC4 mRNA in PDAC",
      "Wnt/β-catenin signalling pathway with downstream TCF/LEF targets",
      "Bivalent chromatin transitions from H3K4me3+H3K27me3 to H3K4me3-only during PanIN progression",
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <AppSidebar />

      <div className="max-w-5xl mx-auto px-6 pt-8 pb-24 md:pl-24">
        {/* ─── BRAND ─── */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-800">AnyFigure</span>
        </div>

        {/* ─── HERO ─── */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            Editable figures, generated.
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Type a research idea. We compose a vector scene graph — every protein, arrow and label
            is born editable. No raster traps, no OCR guesswork.
          </p>
        </div>

        {/* ─── MODE TABS ─── */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex bg-slate-100 rounded-full p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("illustration")}
              className={`px-4 py-1.5 rounded-full transition-colors ${
                mode === "illustration"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Scientific illustration
            </button>
            <button
              type="button"
              onClick={() => setMode("flowchart")}
              className={`px-4 py-1.5 rounded-full transition-colors ${
                mode === "flowchart"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Flowchart
              <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-700">
                beta
              </span>
            </button>
          </div>
        </div>

        {/* ─── PROMPT BOX ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 md:p-4 mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !generating) {
                void handleGenerate();
              }
            }}
            placeholder="Describe the mechanism, pathway, or experiment you want illustrated…"
            rows={4}
            className="w-full resize-none outline-none text-sm text-slate-800 placeholder:text-slate-400 px-2 py-2"
            disabled={generating}
          />
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" strokeLinejoin="round" />
              </svg>
              <span>Vector scene graph</span>
              <span className="hidden md:inline text-slate-300">·</span>
              <span className="hidden md:inline">Cmd+Enter to generate</span>
            </div>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={generating || !prompt.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {generating ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Composing scene…
                </>
              ) : (
                <>
                  Generate
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6h8M7 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── CATEGORY CHIPS ─── */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setPrompt((p) => (p ? p : c.prompt))}
              className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ─── EXAMPLE PROMPTS ─── */}
        {!prompt && (
          <div className="mb-12">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 font-semibold">
              Try
            </p>
            <div className="grid gap-2">
              {examplePrompts.map((ep) => (
                <button
                  key={ep}
                  type="button"
                  onClick={() => setPrompt(ep)}
                  className="text-left text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  &ldquo;{ep}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── RECENT PROJECTS ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent projects</h2>
            <Link
              href="/projects"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              See all →
            </Link>
          </div>
          {loadingRecent ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
              <p className="text-sm text-slate-500">
                No projects yet — type a prompt above to generate your first figure.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recent.slice(0, 8).map((fig) => (
                <RecentCard key={fig.id} fig={fig} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentCard({
  fig,
  onDelete,
}: {
  fig: StoredFigure;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const thumb =
    fig.plan?.panels?.find((p) => p.imageUrl)?.imageUrl ??
    fig.pngUrl ??
    fig.svgUrl ??
    null;

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
      <button
        type="button"
        onClick={() => router.push(`/workspace?figure=${encodeURIComponent(fig.id)}`)}
        className="block w-full text-left"
      >
        <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt={fig.prompt} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-300">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M3 14l5-4 4 3 4-5 5 6" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <p className="text-xs font-medium text-slate-900 line-clamp-2 leading-snug">
            {fig.prompt || "Untitled figure"}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {new Date(fig.timestamp).toLocaleDateString()}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(fig.id);
        }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete"
      >
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
