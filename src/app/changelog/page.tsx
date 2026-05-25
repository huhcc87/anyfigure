import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata = {
  title: "Changelog · AnyFigure",
  description: "Every shipped change, every week.",
};

const ENTRIES: { date: string; version: string; title: string; items: { type: "feat" | "fix" | "perf" | "ui"; label: string }[] }[] = [
  {
    date: "May 25, 2026",
    version: "2.1.0",
    title: "Editorial UI, IDB figure recovery, URL-driven workspace loads",
    items: [
      { type: "ui", label: "Light editorial theme replaces dark hero — warm off-white, deep slate, single teal accent." },
      { type: "fix", label: "Recent projects now resurface figures saved by older app versions via two-stage IDB recovery." },
      { type: "fix", label: "Workspace loads figures from ?figure= and ?scene= URL params on cold navigation." },
      { type: "ui", label: "Empty-canvas placeholder no longer references the retired Studio." },
    ],
  },
  {
    date: "May 24, 2026",
    version: "2.0.0",
    title: "Vector scene-graph engine + Nano Banana Pro picker",
    items: [
      { type: "feat", label: "Prompt → Scene Graph → Vector Primitives → Editable Canvas pipeline shipped." },
      { type: "feat", label: "Model picker on home: Vector AI (editable) vs Nano Banana Pro (raster)." },
      { type: "feat", label: "/features, /pricing, /privacy, /security, /terms shipped with original content." },
      { type: "feat", label: "AppSidebar icon rail unified across Home / Projects / Library / Editor." },
      { type: "fix", label: "Retired /ai-figure-studio — now redirects to /." },
    ],
  },
  {
    date: "May 23, 2026",
    version: "1.9.0",
    title: "Drag-to-fix labels, expanded text masks, Pro vision model",
    items: [
      { type: "feat", label: "Drag misaligned dashed boxes in Quick Text Edit to nudge them onto the right text." },
      { type: "fix", label: "Pending-edit mask grows to fit longer edited text — no more leak past the right edge." },
      { type: "perf", label: "Default vision model switched to gemini-2.5-pro with automatic Flash fallback." },
      { type: "fix", label: "Bbox parser auto-detects all 3 Gemini coordinate conventions." },
    ],
  },
  {
    date: "May 22, 2026",
    version: "1.8.0",
    title: "FigureLabs-style editor + canvas import",
    items: [
      { type: "feat", label: "Every detected label imported as an editable CanvasElement (not just user-edited ones)." },
      { type: "feat", label: "Workspace mount-time useEffect loads cached plans into the canvas automatically." },
      { type: "fix", label: "Increased Gemini image generation timeouts on all routes; added maxDuration." },
    ],
  },
];

const TYPE_STYLE: Record<string, string> = {
  feat: "bg-emerald-100 text-emerald-800",
  fix: "bg-amber-100 text-amber-800",
  perf: "bg-indigo-100 text-indigo-800",
  ui: "bg-pink-100 text-pink-800",
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-12 text-center">
          <p className="text-[11px] uppercase tracking-wider text-teal-700 font-semibold mb-2">Changelog</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">What we shipped.</h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            Public, dated, and honest. Every meaningful change to AnyFigure since launch.
          </p>
        </div>

        <div className="space-y-12">
          {ENTRIES.map((entry) => (
            <article key={entry.version} className="border-l-2 border-slate-200 pl-6 relative">
              <div className="absolute -left-[6px] top-2 w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-white" />
              <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                <h2 className="text-lg font-semibold text-slate-900">v{entry.version}</h2>
                <span className="text-xs text-slate-500">{entry.date}</span>
              </div>
              <p className="text-sm font-medium text-slate-700 mb-4">{entry.title}</p>
              <ul className="space-y-2">
                {entry.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 mt-0.5 ${TYPE_STYLE[it.type]}`}>
                      {it.type}
                    </span>
                    <span className="text-sm text-slate-700 leading-relaxed">{it.label}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
