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
    return () => { cancelled = true; };
  }, []);

  const handleGenerate = useCallback(async () => {
    const text = prompt.trim();
    if (!text) { toast.error("Describe what you want to draw"); return; }
    setGenerating(true);
    try {
      toast.info("Composing vector scene graph…");
      const res = await fetch("/api/ai/generate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, numPanels: 2, scientificField: "biomedical" }),
      });
      const data = (await res.json()) as { scene?: SceneGraph; error?: string };
      if (!res.ok || !data.scene) {
        toast.error(data.error || "Generation failed");
        return;
      }
      try {
        sessionStorage.setItem(SCENE_SESSION_KEY, JSON.stringify(data.scene));
      } catch {
        toast.warning("Browser storage is full — scene may not persist");
      }
      const id = `vec-${Date.now()}`;
      const fig: StoredFigure = {
        id, prompt: text.slice(0, 120),
        panels: data.scene.elements?.length ?? 0,
        mode: "vector",
        timestamp: new Date().toISOString(),
        editableReady: true,
      };
      const updated = pruneRecentFigures([fig, ...recent]);
      await saveRecentFigures(updated);
      void cacheEditPlan(id, {
        title: text.slice(0, 80), panels: [],
        // @ts-expect-error — scene piggy-backed on plan cache
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

  const examplePrompts = useMemo(() => [
    "Tumor-immune crosstalk: CD8+ T cells, PD-L1+ tumor, MHC-I downregulation, IFN-γ feedback",
    "m6A regulation of MUC4 mRNA by METTL3 / YTHDF2 / IGF2BP1-3 in PDAC progression",
    "Wnt/β-catenin pathway with downstream TCF/LEF transcription targets",
  ], []);

  return (
    <div className="hero-3d min-h-screen text-white flex flex-col relative">
      {/* ─── DARK GLASS NAV ─── */}
      <DarkNav />

      {/* Floating organic blobs (animated) */}
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />
      <div className="blob blob-d" />

      {/* ─── BIOMEDICAL MOLECULE BACKDROP ─── */}
      <MoleculeDecor />

      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 pt-16 md:pt-24 pb-20">
        {/* ─── HERO ─── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur text-[11px] text-indigo-200 font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            New · Vector scene-graph engine v2.0 is live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-4">
            Editable science figures,<br />
            <span className="gradient-text">composed as vectors.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Type a research idea. We compose a scene graph of proteins, pathways and labels —
            every primitive born <strong className="text-white">editable, draggable, retypeable</strong>.
            No raster traps. No OCR guesswork. Built for biomedical teams.
          </p>
        </div>

        {/* ─── MODE PILL ─── */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex glass p-1 rounded-full text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("illustration")}
              className={`px-4 py-2 rounded-full transition-all ${
                mode === "illustration"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🧬 Scientific illustration
            </button>
            <button
              type="button"
              onClick={() => setMode("flowchart")}
              className={`px-4 py-2 rounded-full transition-all ${
                mode === "flowchart"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              ⊞ Flowchart
              <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-indigo-500/30 text-indigo-200">beta</span>
            </button>
          </div>
        </div>

        {/* ─── GLASS PROMPT BOX ─── */}
        <div className="glass rounded-3xl p-2 md:p-3 mb-6 max-w-3xl mx-auto">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !generating) void handleGenerate();
            }}
            placeholder="Describe a mechanism, pathway, or experimental design…"
            rows={4}
            className="w-full resize-none outline-none text-sm md:text-base text-white placeholder:text-slate-400 bg-transparent px-4 py-3"
            disabled={generating}
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-1">
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" strokeLinejoin="round" />
                </svg>
                Vector scene graph
              </span>
              <span className="hidden md:inline text-slate-600">·</span>
              <span className="hidden md:inline">⌘ Enter to generate</span>
            </div>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={generating || !prompt.trim()}
              className="glow-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-3xl mx-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setPrompt((p) => (p ? p : c.prompt))}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/50 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer backdrop-blur"
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ─── EXAMPLE PROMPTS (only when input empty) ─── */}
        {!prompt && (
          <div className="mb-16 max-w-3xl mx-auto">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-3 font-semibold text-center">
              Try one of these
            </p>
            <div className="grid gap-2">
              {examplePrompts.map((ep) => (
                <button
                  key={ep}
                  type="button"
                  onClick={() => setPrompt(ep)}
                  className="card-3d text-left text-sm text-slate-200 hover:text-white bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/40 px-4 py-3 rounded-2xl transition-all cursor-pointer backdrop-blur"
                >
                  <span className="text-indigo-300 mr-2">›</span>
                  {ep}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── 3-COLUMN VALUE PROPS ─── */}
        <div className="grid md:grid-cols-3 gap-4 my-20">
          <ValueCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
              </svg>
            }
            title="Vector by construction"
            body="Scene graph → SVG primitives. Every protein, arrow and label is a real text node, not a baked-in pixel."
          />
          <ValueCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
                <path d="M12 2v4M12 18v4M22 12h-4M6 12H2M19 5l-2.5 2.5M7.5 16.5L5 19M19 19l-2.5-2.5M7.5 7.5L5 5" strokeLinecap="round" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            }
            title="600+ biomedical assets"
            body="Curated proteins, immune cells, organelles, CRISPR primitives — drop in, no licensing headache."
          />
          <ValueCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
                <path d="M6 1l4 2v3.5a5 5 0 0 1-4 5 5 5 0 0 1-4-5V3z M12 1l4 2v3.5a5 5 0 0 1-4 5 5 5 0 0 1-4-5" transform="translate(4 6)" />
                <path d="M4 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Built for biomedical trust"
            body="SOC 2, GDPR, HIPAA-ready. Your prompts never train foundation models. EU & US data residency."
          />
        </div>

        {/* ─── RECENT PROJECTS ─── */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-white">Recent projects</h2>
            <Link href="/projects" className="text-xs font-medium text-indigo-300 hover:text-white transition-colors">
              See all →
            </Link>
          </div>
          {loadingRecent ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="glass rounded-3xl py-14 text-center">
              <p className="text-sm text-slate-300">
                No projects yet — type a prompt above to generate your first vector figure.
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

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

/* ─── DARK GLASS NAV (replaces SiteHeader on the hero) ─── */
function DarkNav() {
  return (
    <header className="sticky top-0 z-40 px-4 py-3 md:px-6 md:py-4">
      <div className="max-w-7xl mx-auto glass rounded-2xl px-3 md:px-5 py-2.5 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm brand-glow">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">AnyFigure</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {[
            { href: "/", label: "Home" },
            { href: "/projects", label: "Projects" },
            { href: "/library", label: "Library" },
            { href: "/workspace", label: "Editor" },
            { href: "/pricing", label: "Pricing" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <Link href="/security" className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 1l4 2v3.5a5 5 0 0 1-4 5 5 5 0 0 1-4-5V3z" />
            <path d="M4 6l1.5 1.5L8 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Encrypted
        </Link>
        <Link href="/pricing" className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[11px] font-semibold hover:bg-amber-400/20">
          ⚡ Upgrade
        </Link>
        <Link href="/sign-in" className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100">
          Sign in
        </Link>
      </div>
    </header>
  );
}

/* ─── Floating biomedical molecule SVG decor in the hero background ─── */
function MoleculeDecor() {
  return (
    <>
      <svg className="absolute top-32 left-8 md:left-20 w-16 h-16 text-indigo-300/30 float-slow pointer-events-none" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="32" cy="32" r="8" />
        <circle cx="12" cy="22" r="5" />
        <circle cx="52" cy="22" r="5" />
        <circle cx="22" cy="52" r="5" />
        <circle cx="46" cy="52" r="5" />
        <path d="M28 28L16 24M36 28L48 24M30 36L26 48M34 36L42 48" />
      </svg>
      <svg className="absolute top-40 right-10 md:right-32 w-20 h-20 text-cyan-300/25 float-slow pointer-events-none" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ animationDelay: "-2s" }}>
        <path d="M10 40c0-16 12-28 30-28s30 12 30 28-12 28-30 28S10 56 10 40z" />
        <path d="M10 40h60M28 14c-4 8-4 18 0 26 4 8 4 16 0 26M52 14c4 8 4 18 0 26-4 8-4 16 0 26" />
      </svg>
      <svg className="absolute bottom-32 left-10 md:left-40 w-14 h-14 text-purple-300/25 spin-slow pointer-events-none" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="24" cy="24" r="20" strokeDasharray="3 6" />
        <circle cx="24" cy="24" r="6" />
      </svg>
      <svg className="absolute bottom-44 right-8 md:right-44 w-24 h-12 text-teal-300/25 float-slow pointer-events-none" viewBox="0 0 96 48" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ animationDelay: "-5s" }}>
        <path d="M4 24 Q 16 4, 28 24 T 52 24 T 76 24 T 100 24" />
        <path d="M4 24 Q 16 44, 28 24 T 52 24 T 76 24 T 100 24" />
      </svg>
    </>
  );
}

/* ─── Glass value-prop card ─── */
function ValueCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card-3d glass rounded-2xl p-5 group">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 flex items-center justify-center text-indigo-200 mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}

/* ─── Recent project card (dark glass) ─── */
function RecentCard({ fig, onDelete }: { fig: StoredFigure; onDelete: (id: string) => void }) {
  const router = useRouter();
  const thumb = fig.plan?.panels?.find((p) => p.imageUrl)?.imageUrl ?? fig.pngUrl ?? fig.svgUrl ?? null;
  return (
    <div className="group relative card-3d rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-indigo-400/40 overflow-hidden backdrop-blur">
      <button type="button" onClick={() => router.push(`/workspace?figure=${encodeURIComponent(fig.id)}`)} className="block w-full text-left">
        <div className="aspect-square bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex items-center justify-center overflow-hidden">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt={fig.prompt} className="w-full h-full object-cover" />
          ) : (
            <div className="text-indigo-300/40">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M3 14l5-4 4 3 4-5 5 6" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <p className="text-xs font-medium text-white line-clamp-2 leading-snug">{fig.prompt || "Untitled figure"}</p>
          <p className="text-[10px] text-slate-400 mt-1">{new Date(fig.timestamp).toLocaleDateString()}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(fig.id); }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-slate-300 hover:bg-red-500/30 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete"
      >
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
