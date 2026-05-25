"use client";

import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

interface Feature {
  id: string;
  tag: string;
  title: string;
  body: string;
  bullets: string[];
}

const FEATURES: Feature[] = [
  {
    id: "scene-graph",
    tag: "Scene-graph generation",
    title: "From a research prompt to a vector scene in one pass.",
    body: "We don't generate a raster image and OCR it back. We compose a scene graph of typed primitives — proteins, arrows, cells, labels — and render each one as a real SVG/canvas element. Everything is editable at the moment it lands on the canvas.",
    bullets: [
      "Vector AI (DeepSeek / OpenAI) emits a strict JSON scene graph",
      "Nano Banana Pro (Gemini 3 Pro Image) for richly illustrated raster figures",
      "Arrows reference shape ids so they snap to centers automatically",
      "Auto layout with 1600×1000 px canvas + margins",
    ],
  },
  {
    id: "text-edit",
    tag: "Inline text editing",
    title: "Click any label. Type. Move on.",
    body: "Every text node in the canvas is contentEditable. Double-click to edit, drag to reposition, resize from the corner handles, recolor from the Properties panel. For raster figures (Nano Banana Pro), one click on Make Text Editable runs Gemini Vision and turns every detected label into a draggable text element with a white mask that hides the underlying baked-in text.",
    bullets: [
      "Cmd+Enter to commit a label edit",
      "Drag-to-reposition for OCR labels that landed off-center",
      "White-mask grows to fit longer edited text",
      "Per-region userEdited / userPositioned flags persisted to IndexedDB",
    ],
  },
  {
    id: "biomedical-assets",
    tag: "600+ biomedical assets",
    title: "Curated vector primitives for cancer, immunology, genomics.",
    body: "A drop-in library of proteins, immune cells, bacterial cells, organelles, CRISPR primitives, lab equipment, microbiome elements and pathway nodes — all original SVG, all licensed for internal AnyFigure use, no third-party IP risk.",
    bullets: [
      "Categories: DNA/RNA · Proteins · Cells · Bacteria · Immune cells · Tumor cells · Organs · CRISPR · Sequencing · Pathways · Microbiome · Lab equipment",
      "Each asset has scientificName + emoji + tags for quick search",
      "Bring in by drag-and-drop or via the AI scene graph (it picks for you)",
    ],
  },
  {
    id: "charts",
    tag: "Built-in charts",
    title: "Bar, line, KM curves, volcano, heatmap, scatter, pie.",
    body: "Every chart preset is a real Canvas element you can re-style — colors, fonts, axes, gridlines. Paste in your own CSV or let the AI populate dummy data that matches the panel description.",
    bullets: [
      "Bar, Line, Scatter, Pie, Heatmap",
      "Volcano plot, Kaplan-Meier survival, Box plot",
      "Color-blind-safe palettes (Okabe-Ito, Viridis, Wong)",
    ],
  },
  {
    id: "export",
    tag: "SVG / PNG / PDF / PPTX export",
    title: "Editable text preserved in every format.",
    body: "Export to SVG and the text remains <text> nodes — open in Illustrator or Inkscape and continue editing. PPTX maps every shape to a native PowerPoint shape and every label to a native text box. PNG and PDF rasterize at 300 DPI for journal submission.",
    bullets: [
      "SVG: editable <text>, paths, groups — preserved structure",
      "PPTX: native PowerPoint shapes and text boxes, ready for slides",
      "PNG: 1× / 2× / 3× DPR, transparent or white background",
      "PDF: vector-preserved, embeds fonts",
    ],
  },
  {
    id: "collaboration",
    tag: "Collaboration",
    title: "Share a project link. Edit in the same canvas.",
    body: "On the Team plan, projects live in a shared workspace with role-based access (Owner / Admin / Editor / Viewer). Real-time co-editing on the canvas, commit history, comments threaded on individual elements.",
    bullets: [
      "Real-time multi-cursor editing via Yjs CRDT",
      "Per-project access control + audit log",
      "Comments threaded on any canvas element",
      "SSO (Google / Microsoft / SAML)",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <p className="text-[11px] uppercase tracking-wider text-teal-700 font-semibold mb-2">Features</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Every primitive editable. Every workflow covered.</h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            What AnyFigure does, in detail — from the scene-graph engine to the export pipeline. Jump to any
            section using the in-page nav.
          </p>
        </div>

        {/* In-page nav */}
        <nav className="flex flex-wrap justify-center gap-2 mb-16">
          {FEATURES.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
            >
              {f.tag}
            </a>
          ))}
        </nav>

        {/* Feature sections */}
        <div className="space-y-20">
          {FEATURES.map((f, i) => (
            <section key={f.id} id={f.id} className="scroll-mt-20">
              <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <p className="text-[11px] uppercase tracking-wider text-teal-700 font-semibold mb-2">
                    0{i + 1} · {f.tag}
                  </p>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mt-3">
                    <FeatureIcon id={f.id} />
                  </div>
                </div>
                <div className="md:col-span-8">
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">{f.title}</h2>
                  <p className="text-base text-slate-600 leading-relaxed mb-5">{f.body}</p>
                  <ul className="space-y-2">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
                        <svg className="w-4 h-4 mt-0.5 shrink-0 text-teal-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24 rounded-3xl bg-slate-900 text-white p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Ready to ship a figure?</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-6">
            Start with a free account. No credit card. Generate up to 20 figures per month.
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/sign-up" className="px-5 py-2.5 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100">
              Start free
            </Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10">
              See pricing
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function FeatureIcon({ id }: { id: string }) {
  if (id === "scene-graph") return <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h8M8 18h8M6 8v8M18 8v8" /></svg>;
  if (id === "text-edit") return <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinejoin="round" /></svg>;
  if (id === "biomedical-assets") return <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="4" /><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>;
  if (id === "charts") return <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 20V8M10 20V4M16 20v-9M22 20H2" strokeLinecap="round" /></svg>;
  if (id === "export") return <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3v12M7 10l5 5 5-5M4 19h16" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="9" r="3" /><circle cx="17" cy="15" r="3" /><path d="M11.5 11l3 2.5M3 21v-2a4 4 0 014-4h2M14 13v-1a4 4 0 014-4h2" /></svg>;
}
