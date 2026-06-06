"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/layout/AppSidebar";
import {
  loadRecentFigures,
  recoverFigureListFromIdb,
  hydrateStoredFigures,
  removeRecentFigure,
  type StoredFigure,
} from "@/lib/figureStore";

type SortKey = "recent" | "oldest" | "name";

export default function ProjectsPage() {
  const router = useRouter();
  const [list, setList] = useState<StoredFigure[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let figures = loadRecentFigures();
      if (figures.length === 0) {
        figures = await recoverFigureListFromIdb();
      }
      const hydrated = await hydrateStoredFigures(figures);
      if (!cancelled) {
        setList(hydrated);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = q
      ? list.filter(
          (f) => f.prompt.toLowerCase().includes(q) || f.plan?.title?.toLowerCase().includes(q)
        )
      : [...list];
    if (sort === "recent") {
      next.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sort === "oldest") {
      next.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else {
      next.sort((a, b) => (a.prompt || "").localeCompare(b.prompt || ""));
    }
    return next;
  }, [list, query, sort]);

  const handleDelete = (id: string) => {
    removeRecentFigure(id);
    setList((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />

      <div className="max-w-7xl mx-auto px-6 py-8 md:pl-24">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
            <p className="text-sm text-slate-500 mt-1">
              Every figure you have generated. Click any card to open it in the vector editor.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2v8M2 6h8" strokeLinecap="round" />
            </svg>
            New project
          </Link>
        </div>

        <div className="flex items-center gap-2 my-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A→Z</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-sm text-slate-500 mb-3">
              {query ? "No projects match that search." : "No projects yet."}
            </p>
            {!query && (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Create your first project →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((fig) => (
              <ProjectCard key={fig.id} fig={fig} onOpen={() => router.push(`/workspace?figure=${encodeURIComponent(fig.id)}`)} onDelete={() => handleDelete(fig.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  fig,
  onOpen,
  onDelete,
}: {
  fig: StoredFigure;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const thumb =
    fig.plan?.panels?.find((p) => p.imageUrl)?.imageUrl ??
    fig.pngUrl ??
    fig.svgUrl ??
    null;

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="aspect-video bg-slate-50 flex items-center justify-center overflow-hidden">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt={fig.prompt} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-300">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M3 14l5-4 4 3 4-5 5 6" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug">
            {fig.plan?.title || fig.prompt || "Untitled figure"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Last active {new Date(fig.timestamp).toLocaleDateString()}
            {fig.mode ? ` · ${fig.mode}` : ""}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
