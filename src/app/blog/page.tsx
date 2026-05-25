import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata = {
  title: "Blog · AnyFigure",
  description: "Engineering, design, and biomedical-figure deep-dives from the AnyFigure team.",
};

interface Post {
  slug: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  readMin: number;
}

const POSTS: Post[] = [
  {
    slug: "vector-vs-raster",
    date: "May 25, 2026",
    category: "Engineering",
    title: "Why we threw away raster + OCR and rebuilt our pipeline around scene graphs",
    excerpt: "Most AI figure tools generate an image and then OCR text boxes back. We tried that for six months. Here is exactly why it never gets to publication quality and what we shipped instead.",
    readMin: 9,
  },
  {
    slug: "gemini-bbox-formats",
    date: "May 23, 2026",
    category: "Engineering",
    title: "Gemini Vision returns bboxes in three different formats. Here is how to handle all of them.",
    excerpt: "The prompt asks for [x, y, w, h] normalized 0–1. The model returns one of three formats depending on the moon phase. This is the heuristic that gets it right every time.",
    readMin: 6,
  },
  {
    slug: "color-blind-safe-palettes",
    date: "May 20, 2026",
    category: "Design",
    title: "Color-blind-safe palettes for biomedical figures: Okabe-Ito, Viridis, Wong, explained",
    excerpt: "About 8% of men and 0.5% of women have some form of color-vision deficiency. Three palettes that look great AND get past reviewers without rework.",
    readMin: 7,
  },
  {
    slug: "publishing-checklist",
    date: "May 15, 2026",
    category: "Best practices",
    title: "The 12-item checklist every biomedical figure must pass before submission",
    excerpt: "Resolution, font sizes, color, statistics, panel labels, data ink, alignment, captions, units, citations, ethics, accessibility. From Nature, Cell, JCI guidelines distilled.",
    readMin: 12,
  },
  {
    slug: "self-hosting",
    date: "May 8, 2026",
    category: "Enterprise",
    title: "Self-hosting AnyFigure: Docker, Helm, bring-your-own-LLM",
    excerpt: "Some institutions cannot let prompts leave their infrastructure. Here is the full deployment guide for the enterprise self-hosted edition.",
    readMin: 14,
  },
];

const CAT_STYLE: Record<string, string> = {
  Engineering: "bg-indigo-100 text-indigo-800",
  Design: "bg-pink-100 text-pink-800",
  "Best practices": "bg-emerald-100 text-emerald-800",
  Enterprise: "bg-amber-100 text-amber-800",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-6 py-14">
        <div className="mb-14 text-center">
          <p className="text-[11px] uppercase tracking-wider text-teal-700 font-semibold mb-2">Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Engineering, design, biomedicine.</h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Deep dives from the AnyFigure team on the technical, visual, and scientific decisions
            behind every release.
          </p>
        </div>

        <div className="space-y-8">
          {POSTS.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block py-4 border-b border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${CAT_STYLE[post.category] || "bg-slate-100 text-slate-700"}`}>
                    {post.category}
                  </span>
                  <span className="text-[11px] text-slate-500">{post.date}</span>
                  <span className="text-[11px] text-slate-400">·</span>
                  <span className="text-[11px] text-slate-500">{post.readMin} min read</span>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">{post.excerpt}</p>
                <p className="text-xs font-semibold text-teal-700 mt-3">Read article →</p>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <h3 className="text-lg font-semibold mb-1">Get new posts in your inbox</h3>
          <p className="text-sm text-slate-600 mb-4">No spam. Maybe two emails a month, when something is worth reading.</p>
          <div className="flex justify-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="you@lab.edu"
              className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button type="button" className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800">
              Subscribe
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
