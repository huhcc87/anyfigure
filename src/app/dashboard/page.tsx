import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

const recentProjects = [
  { id: "p1", name: "CRISPR Cas9 Mechanism", updated: "2 hours ago", panels: 4, thumbnail: "from-teal-500 to-cyan-600" },
  { id: "p2", name: "RNA-seq Volcano Plot", updated: "Yesterday", panels: 2, thumbnail: "from-violet-500 to-indigo-600" },
  { id: "p3", name: "TME Immunosuppression", updated: "3 days ago", panels: 6, thumbnail: "from-rose-500 to-red-600" },
  { id: "p4", name: "PI3K/AKT Signaling", updated: "1 week ago", panels: 3, thumbnail: "from-blue-500 to-indigo-600" },
  { id: "p5", name: "Gut Microbiome Diversity", updated: "1 week ago", panels: 5, thumbnail: "from-emerald-500 to-green-600" },
];

const recentPrompts = [
  "Show CRISPR Cas9 editing of KRAS in pancreatic cancer cells",
  "Create RNA-seq pipeline from raw reads to differential expression",
  "Illustrate tumor immune evasion mechanisms with checkpoints",
  "Depict gut microbiome composition in IBD vs healthy controls",
];

const exportHistory = [
  { name: "CRISPR Figure v3.png", size: "4.2 MB", format: "PNG", date: "Today" },
  { name: "RNA-seq Pipeline.pdf", size: "1.8 MB", format: "PDF", date: "Yesterday" },
  { name: "TME Overview.pptx", size: "3.1 MB", format: "PPTX", date: "3 days ago" },
];

const stats = [
  { label: "AI Credits", value: "142", subtitle: "remaining this month", icon: "⚡", color: "from-amber-500/15 to-orange-500/10", border: "border-amber-500/20" },
  { label: "Projects", value: "23", subtitle: "total figures created", icon: "🗂", color: "from-indigo-500/15 to-violet-500/10", border: "border-indigo-500/20" },
  { label: "Exports", value: "47", subtitle: "files downloaded", icon: "📤", color: "from-emerald-500/15 to-green-500/10", border: "border-emerald-500/20" },
  { label: "Templates Used", value: "8", subtitle: "across all projects", icon: "📋", color: "from-cyan-500/15 to-teal-500/10", border: "border-cyan-500/20" },
];

const quickActions = [
  { label: "New Figure with AI", href: "/ai-figure-studio", icon: "✦", color: "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25" },
  { label: "Open Workspace", href: "/workspace", icon: "⬡", color: "bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10" },
  { label: "Browse Templates", href: "/templates", icon: "▦", color: "bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#080C1C] text-white">
      <Navbar />

      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Welcome back. Your figures are ready.</p>
          </div>
          <div className="flex items-center gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${action.color}`}
              >
                <span>{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.border} p-5`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
              <div className="text-xs font-medium text-zinc-400">{stat.label}</div>
              <div className="text-xs text-zinc-600 mt-0.5">{stat.subtitle}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Projects (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Recent Projects</h2>
              <Link href="/workspace" className="text-xs text-indigo-400 hover:text-indigo-300">
                View all
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {/* New project card */}
              <Link
                href="/workspace"
                className="border-2 border-dashed border-white/10 rounded-2xl p-5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-2 min-h-[140px] group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-indigo-500/10 flex items-center justify-center transition-colors">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-zinc-600 group-hover:text-indigo-400 transition-colors">
                    <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-sm text-zinc-600 group-hover:text-indigo-400 transition-colors font-medium">New Project</span>
              </Link>

              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href="/workspace"
                  className="block bg-[#0F1629] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 hover:shadow-lg hover:shadow-black/20 transition-all group"
                >
                  <div className={`h-24 bg-gradient-to-br ${project.thumbnail} opacity-80 group-hover:opacity-100 transition-opacity relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-1.5 w-16">
                        {Array.from({ length: Math.min(project.panels, 4) }).map((_, i) => (
                          <div key={i} className="aspect-square rounded bg-white/15 border border-white/20" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-white mb-0.5 truncate">{project.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600">{project.updated}</span>
                      <span className="text-xs text-zinc-600">{project.panels} panels</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* AI Credits */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">AI Credits</h3>
                <span className="text-xs font-bold text-indigo-400">Pro Plan</span>
              </div>
              <div className="mb-3">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-white">142</span>
                  <span className="text-zinc-500 text-sm">/ 200</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: "71%" }} />
                </div>
                <p className="text-xs text-zinc-600 mt-1.5">Resets in 18 days</p>
              </div>
              <Link href="/ai-figure-studio" className="block w-full py-2 text-xs font-semibold text-center rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors border border-indigo-500/20">
                Use AI Studio →
              </Link>
            </div>

            {/* Recent Prompts */}
            <div className="bg-[#0F1629] border border-white/8 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Recent Prompts</h3>
              <div className="space-y-2">
                {recentPrompts.map((prompt, i) => (
                  <div key={i} className="text-xs text-zinc-500 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 cursor-pointer transition-colors line-clamp-2 hover:text-zinc-400">
                    <span className="text-indigo-400/70 mr-1">✦</span>
                    {prompt}
                  </div>
                ))}
              </div>
            </div>

            {/* Export History */}
            <div className="bg-[#0F1629] border border-white/8 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Export History</h3>
              </div>
              <div className="space-y-2">
                {exportHistory.map((file) => (
                  <div key={file.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-zinc-500 flex-shrink-0">
                      {file.format}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-zinc-300 truncate">{file.name}</div>
                      <div className="text-xs text-zinc-600">{file.size} · {file.date}</div>
                    </div>
                    <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 2v7M4 7l2.5 2.5L9 7M2 11h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Workspace */}
            <div className="bg-gradient-to-br from-cyan-500/8 to-teal-500/5 border border-cyan-500/15 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-cyan-400">
                    <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1.5 14c0-2.5 2-4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="11" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M8 14c0-2 1.3-3.5 3-3.5s3 1.5 3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Team Workspace</h3>
                  <p className="text-xs text-zinc-500">Collaborate with your lab</p>
                </div>
              </div>
              <button className="w-full py-2 text-xs font-medium text-center rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 transition-colors border border-white/10">
                Invite Team Members
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
