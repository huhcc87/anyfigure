import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata = {
  title: "Documentation · AnyFigure",
  description: "Guides, API reference, and engineering details for AnyFigure.",
};

const SECTIONS: { title: string; intro: string; items: { href: string; title: string; desc: string }[] }[] = [
  {
    title: "Getting started",
    intro: "From zero to your first publication-ready figure in under five minutes.",
    items: [
      { href: "#quickstart", title: "Quickstart", desc: "Generate a figure, edit a label, export PNG." },
      { href: "#prompt-craft", title: "Prompt craft", desc: "Patterns that produce clean scene graphs." },
      { href: "#keyboard", title: "Keyboard shortcuts", desc: "Cmd+Z undo, V select, T text, A arrow." },
    ],
  },
  {
    title: "Vector AI engine",
    intro: "How prompts become editable scene graphs.",
    items: [
      { href: "#scene-graph-spec", title: "Scene graph spec", desc: "JSON shape, primitive types, layout rules." },
      { href: "#biomedical-asset-ids", title: "Biomedical asset IDs", desc: "Browse the 600+ asset catalogue." },
      { href: "#troubleshooting", title: "Troubleshooting", desc: "Sparse output, wrong layout, missing arrows." },
    ],
  },
  {
    title: "Editor",
    intro: "Manipulating the canvas after generation.",
    items: [
      { href: "#layers", title: "Layers & grouping", desc: "Title / Shapes / Biomedical / Arrows / Labels / Legend." },
      { href: "#typography", title: "Typography", desc: "Fonts, sizes, weights, color-blind-safe palettes." },
      { href: "#text-extraction", title: "Make Text Editable", desc: "OCR for Nano Banana Pro raster figures." },
    ],
  },
  {
    title: "Export & integrations",
    intro: "Get figures into your paper, slides, or pipeline.",
    items: [
      { href: "#svg-export", title: "SVG export", desc: "Preserves editable text and structure." },
      { href: "#pptx-export", title: "PPTX export", desc: "Native PowerPoint shapes and text boxes." },
      { href: "#api", title: "REST API", desc: "Programmatic figure generation (Pro & Team plans)." },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-14">
        <div className="mb-12 text-center">
          <p className="text-[11px] uppercase tracking-wider text-teal-700 font-semibold mb-2">Documentation</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Build, edit, ship figures.</h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Guides for biologists, reference for engineers. Everything you need to get AnyFigure into your workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {SECTIONS.map((s) => (
            <section key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 transition-colors">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">{s.title}</h2>
              <p className="text-sm text-slate-600 mb-4">{s.intro}</p>
              <ul className="space-y-2">
                {s.items.map((it) => (
                  <li key={it.title}>
                    <Link href={it.href} className="block p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-700">{it.title} →</p>
                      <p className="text-xs text-slate-600 mt-0.5">{it.desc}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-700 mb-2">Can&apos;t find what you need?</p>
          <Link href="/contact" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800">
            Ask the team →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
