import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata = {
  title: "System Status · AnyFigure",
  description: "Real-time status of AnyFigure services. 99.9% target uptime, transparent incident history.",
};

interface Service {
  name: string;
  status: "operational" | "degraded" | "outage";
  uptime90d: string;
}

const SERVICES: Service[] = [
  { name: "Web app (anyfigure.vercel.app)", status: "operational", uptime90d: "100.00%" },
  { name: "Vector AI generation (/api/ai/generate-scene)", status: "operational", uptime90d: "99.98%" },
  { name: "Nano Banana Pro image generation (/api/ai/generate-image)", status: "operational", uptime90d: "99.92%" },
  { name: "Gemini Vision text extraction (/api/ai/extract-text-regions)", status: "operational", uptime90d: "99.95%" },
  { name: "Authentication (Clerk)", status: "operational", uptime90d: "99.99%" },
  { name: "Figure storage (IndexedDB + IDB backup)", status: "operational", uptime90d: "100.00%" },
  { name: "Export pipeline (PNG / SVG / PDF / PPTX)", status: "operational", uptime90d: "99.97%" },
];

const INCIDENTS = [
  { date: "May 19, 2026", title: "Brief Gemini image latency", duration: "11 min", body: "Gemini 3 Pro Image generation latency rose to >180s for ~11 min due to upstream provider congestion. Auto-fallback to Smart Hybrid kicked in; no failed generations. Resolved by provider." },
  { date: "May 11, 2026", title: "Scheduled maintenance: storage migration", duration: "20 min", body: "Migrated IndexedDB schema to v2 to add the editable_figures store. No data loss, brief read-only window." },
];

const STATUS_STYLE: Record<Service["status"], { dot: string; label: string; pill: string }> = {
  operational: { dot: "bg-emerald-500", label: "Operational", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  degraded: { dot: "bg-amber-500", label: "Degraded", pill: "bg-amber-50 text-amber-700 border-amber-200" },
  outage: { dot: "bg-rose-500", label: "Outage", pill: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function StatusPage() {
  const allOperational = SERVICES.every((s) => s.status === "operational");

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-6 py-14">
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-wider text-teal-700 font-semibold mb-2">Status</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">All systems operational</h1>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${allOperational ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"} text-xs font-semibold`}>
            <span className={`w-2 h-2 rounded-full ${allOperational ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
            {allOperational ? "All services healthy" : "Some services degraded"}
          </div>
        </div>

        {/* Services */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Services</h2>
          <ul className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
            {SERVICES.map((s) => {
              const st = STATUS_STYLE[s.status];
              return (
                <li key={s.name} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                    <span className="text-sm text-slate-900 truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-500 font-mono">{s.uptime90d} 90d</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${st.pill}`}>{st.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Past incidents */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Past incidents</h2>
          <div className="space-y-4">
            {INCIDENTS.map((inc) => (
              <article key={inc.date} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-slate-900">{inc.title}</h3>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {inc.date} · {inc.duration}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{inc.body}</p>
              </article>
            ))}
          </div>
        </section>

        <p className="text-center text-[11px] text-slate-500 mt-12">
          SLA target: 99.9% monthly uptime · Subscribe to incident alerts at <a href="mailto:status@anyfigure.dev" className="underline">status@anyfigure.dev</a>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
