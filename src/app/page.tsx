"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import SiteFooter from "@/components/layout/SiteFooter";
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
  { label: "Oncology",     prompt: "Tumor microenvironment with " },
  { label: "Genomics",     prompt: "Multi-omics integration of " },
  { label: "Immunology",   prompt: "Immune signaling cascade for " },
  { label: "Neuroscience", prompt: "Neural circuit diagram of " },
  { label: "Cell Biology", prompt: "Subcellular localization of " },
  { label: "Pharmacology", prompt: "Drug mechanism of action of " },
  { label: "CRISPR",       prompt: "CRISPR-Cas9 knockout strategy for " },
  { label: "Epigenetics",  prompt: "Chromatin state transition during " },
];

const SCENE_SESSION_KEY = "anyfigure_pending_scene";

type GenModel = "vector" | "nano-banana-pro";

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<GenModel>("vector");
  const [generating, setGenerating] = useState(false);
  const [recent, setRecent] = useState<StoredFigure[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let list = loadRecentFigures();
      // Always merge in IDB-resident figures so old saves resurface.
      const recovered = await recoverFigureListFromIdb();
      if (recovered.length > 0) {
        const seen = new Set(list.map((f) => f.id));
        const extras = recovered.filter((f) => !seen.has(f.id));
        if (extras.length > 0) {
          list = pruneRecentFigures([...list, ...extras]);
          void saveRecentFigures(list);
        } else if (list.length === 0) {
          list = recovered;
        }
      }
      const hydrated = await hydrateStoredFigures(list);
      if (!cancelled) {
        setRecent(hydrated);
        setLoadingRecent(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleGenerate = useCallback(async () => {
    const text = prompt.trim();
    if (!text) { toast.error("Describe what you want to draw"); return; }
    setGenerating(true);
    try {
      if (model === "vector") {
        toast.info("Composing vector scene graph…");
        const res = await fetch("/api/ai/generate-scene", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text, numPanels: 2, scientificField: "biomedical" }),
        });
        const data = (await res.json()) as { scene?: SceneGraph; error?: string };
        if (!res.ok || !data.scene) { toast.error(data.error || "Generation failed"); return; }
        try { sessionStorage.setItem(SCENE_SESSION_KEY, JSON.stringify(data.scene)); }
        catch { toast.warning("Browser storage is full — scene may not persist"); }
        const id = `vec-${Date.now()}`;
        const fig: StoredFigure = {
          id, prompt: text.slice(0, 120), panels: data.scene.elements?.length ?? 0,
          mode: "vector", timestamp: new Date().toISOString(), editableReady: true,
        };
        await saveRecentFigures(pruneRecentFigures([fig, ...recent]));
        void cacheEditPlan(id, {
          title: text.slice(0, 80), panels: [],
          // @ts-expect-error — scene piggy-backed on plan cache
          sceneGraph: data.scene,
        });
        router.push(`/workspace?scene=${encodeURIComponent(id)}`);
        return;
      }

      toast.info("Nano Banana Pro is composing — 60-150s for a rich figure…");
      const planRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text, figureType: "schematic", scientificField: "biomedical",
          journalStyle: "Nature", numPanels: 1,
        }),
      });
      const planData = await planRes.json();
      if (!planRes.ok || !planData.plan) { toast.error(planData.error || "Plan failed"); return; }
      const panel = planData.plan.panels?.[0];
      if (!panel) { toast.error("Plan returned no panels"); return; }
      const imgRes = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: panel.label, description: panel.description, dataContext: panel.dataContext,
          chartType: panel.chartType, scientificField: "biomedical", aspectRatio: "16:9",
          style: "flat scientific illustration", inputMode: "enhance",
        }),
      });
      const imgData = await imgRes.json();
      if (!imgRes.ok || !imgData.url) { toast.error(imgData.error || "Image failed"); return; }
      const id = `raster-${Date.now()}`;
      const fullPlan = { ...planData.plan, mode: "image", panels: [{ ...panel, imageUrl: imgData.url }] };
      const fig: StoredFigure = {
        id, prompt: text.slice(0, 120), panels: 1, mode: "image",
        timestamp: new Date().toISOString(),
        plan: fullPlan, pngUrl: imgData.url, editableReady: false,
      };
      await saveRecentFigures(pruneRecentFigures([fig, ...recent]));
      void cacheEditPlan(id, fullPlan);
      router.push(`/workspace?figure=${encodeURIComponent(id)}`);
    } catch (err) {
      console.error("[home] generate failed:", err);
      toast.error("Generation failed — check console");
    } finally {
      setGenerating(false);
    }
  }, [prompt, model, recent, router]);

  const handleDelete = useCallback((id: string) => {
    removeRecentFigure(id);
    setRecent((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const examplePrompts = useMemo(() => [
    "Tumor-immune crosstalk: CD8+ T cells, PD-L1+ tumor, MHC-I downregulation, IFN-γ feedback",
    "m6A regulation of MUC4 mRNA by METTL3 / YTHDF2 / IGF2BP1-3 in PDAC progression",
    "Wnt/β-catenin pathway with downstream TCF/LEF transcription targets",
  ], []);

  return (
    <div className="surface-editorial min-h-screen flex flex-col text-slate-900">
      <EditorialNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-12 pb-20">
        {/* ─── HERO ─── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 font-medium mb-7 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Vector scene-graph engine v2.0
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-slate-900 mb-5 font-display">
            Publication-ready<br />
            <span className="text-teal-700">biomedical figures.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Type a research idea. Choose <strong className="text-slate-900">Vector AI</strong> for
            fully editable schematics or <strong className="text-slate-900">Nano Banana Pro</strong> for
            rich illustrated raster figures. Built for cancer biologists, genomicists and clinicians.
          </p>
        </div>

        {/* ─── MODEL PICKER ─── */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex bg-white border border-slate-200 p-1 rounded-full text-xs font-semibold shadow-sm">
            <button
              type="button"
              onClick={() => setModel("vector")}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                model === "vector"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="2" width="4" height="4" /><rect x="8" y="2" width="4" height="4" />
                <rect x="2" y="8" width="4" height="4" /><rect x="8" y="8" width="4" height="4" />
              </svg>
              Vector AI
              <span className={`text-[9px] px-1 py-0.5 rounded ${model === "vector" ? "bg-teal-500/30 text-teal-100" : "bg-teal-100 text-teal-700"}`}>
                editable
              </span>
            </button>
            <button
              type="button"
              onClick={() => setModel("nano-banana-pro")}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                model === "nano-banana-pro"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M7 2v10M2 7h10M3.5 3.5l7 7M10.5 3.5l-7 7" strokeLinecap="round" />
              </svg>
              Nano Banana Pro
              <span className={`text-[9px] px-1 py-0.5 rounded ${model === "nano-banana-pro" ? "bg-amber-500/30 text-amber-100" : "bg-amber-100 text-amber-700"}`}>
                raster
              </span>
            </button>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-500 mb-5">
          {model === "vector"
            ? "Every protein, arrow and label born editable on the canvas."
            : "Richly illustrated raster figure with editable text overlays after OCR."}
        </p>

        {/* ─── PROMPT BOX ─── */}
        <div className="hairline-card rounded-2xl p-3 max-w-3xl mx-auto">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !generating) void handleGenerate();
            }}
            placeholder="Describe a mechanism, pathway, or experimental design…"
            rows={4}
            className="w-full resize-none outline-none text-[15px] text-slate-900 placeholder:text-slate-400 px-3 py-2.5 bg-transparent"
            disabled={generating}
          />
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3 text-[11px] text-slate-500 pl-2">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" strokeLinejoin="round" />
                </svg>
                Vector scene graph
              </span>
              <span className="hidden md:inline text-slate-300">·</span>
              <span className="hidden md:inline">⌘ Enter to generate</span>
            </div>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={generating || !prompt.trim()}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {generating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Composing
                </>
              ) : (
                <>
                  Generate
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── CATEGORY CHIPS ─── */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 mb-10 max-w-3xl mx-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setPrompt((p) => (p ? p : c.prompt))}
              className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-all cursor-pointer"
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ─── EXAMPLE PROMPTS ─── */}
        {!prompt && (
          <div className="mb-16 max-w-3xl mx-auto">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-3 font-semibold text-center">
              Try one of these
            </p>
            <div className="grid gap-2">
              {examplePrompts.map((ep) => (
                <button
                  key={ep}
                  type="button"
                  onClick={() => setPrompt(ep)}
                  className="hairline-card text-left text-sm text-slate-700 px-4 py-3 rounded-xl cursor-pointer"
                >
                  <span className="text-teal-600 mr-2 font-semibold">›</span>
                  {ep}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── VALUE PROPS ─── */}
        <div className="grid md:grid-cols-3 gap-4 my-16">
          <ValueCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
              </svg>
            }
            title="Vector by construction"
            body="Scene graph → SVG primitives. Every protein, arrow and label is a real text node, not a baked-in pixel."
          />
          <ValueCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v4M12 18v4M22 12h-4M6 12H2M19 5l-2.5 2.5M7.5 16.5L5 19M19 19l-2.5-2.5M7.5 7.5L5 5" strokeLinecap="round" />
              </svg>
            }
            title="600+ biomedical assets"
            body="Curated proteins, immune cells, organelles, CRISPR primitives. Drop in, no licensing headache."
          />
          <ValueCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                <path d="M12 2l9 4v5c0 5-3.5 9.5-9 11-5.5-1.5-9-6-9-11V6l9-4z" />
                <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Built for biomedical trust"
            body="SOC 2, GDPR, HIPAA-ready. Your prompts never train foundation models. EU & US data residency."
          />
        </div>

        {/* ─── RECENT PROJECTS ─── */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Recent projects</h2>
            <Link href="/projects" className="text-xs font-medium text-slate-600 hover:text-slate-900">
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
            <div className="hairline-card rounded-2xl py-14 text-center">
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
      </main>

      <SiteFooter />
    </div>
  );
}

/* ─── Editorial top nav (light, restrained, professional) ─── */
function EditorialNav() {
  return (
    <header className="sticky top-0 z-40 bg-[#fafaf7]/85 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-slate-800 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900">AnyFigure</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {[
            { href: "/", label: "Home" },
            { href: "/projects", label: "Projects" },
            { href: "/library", label: "Library" },
            { href: "/workspace", label: "Editor" },
            { href: "/pricing", label: "Pricing" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <Link href="/security" className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 1l4 2v3.5a5 5 0 0 1-4 5 5 5 0 0 1-4-5V3z" />
            <path d="M4 6l1.5 1.5L8 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Encrypted
        </Link>
        <Link href="/pricing" className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold">
          Upgrade
        </Link>
        <Link href="/sign-in" className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800">
          Sign in
        </Link>
      </div>
    </header>
  );
}

function ValueCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="hairline-card rounded-2xl p-5">
      <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}

function RecentCard({ fig, onDelete }: { fig: StoredFigure; onDelete: (id: string) => void }) {
  const router = useRouter();
  const thumb = fig.plan?.panels?.find((p) => p.imageUrl)?.imageUrl ?? fig.pngUrl ?? fig.svgUrl ?? null;
  return (
    <div className="group relative hairline-card rounded-xl overflow-hidden">
      <button type="button" onClick={() => router.push(`/workspace?figure=${encodeURIComponent(fig.id)}`)} className="block w-full text-left">
        <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt={fig.prompt} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-300">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M3 14l5-4 4 3 4-5 5 6" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-2.5 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-900 line-clamp-2 leading-snug">{fig.prompt || "Untitled figure"}</p>
          <p className="text-[10px] text-slate-500 mt-1">{new Date(fig.timestamp).toLocaleDateString()}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(fig.id); }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete"
      >
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
