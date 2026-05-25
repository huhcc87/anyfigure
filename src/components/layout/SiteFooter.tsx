"use client";

import Link from "next/link";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Home" },
      { href: "/workspace", label: "Vector Editor" },
      { href: "/projects", label: "Projects" },
      { href: "/library", label: "Library" },
      { href: "/templates", label: "Templates" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Features",
    links: [
      { href: "/features#scene-graph", label: "Scene-graph generation" },
      { href: "/features#text-edit", label: "Inline text editing" },
      { href: "/features#biomedical-assets", label: "Biomedical assets" },
      { href: "/features#charts", label: "Built-in charts" },
      { href: "/features#export", label: "SVG / PNG / PPTX export" },
      { href: "/features#collaboration", label: "Collaboration" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/changelog", label: "Changelog" },
      { href: "/blog", label: "Blog" },
      { href: "/showcase", label: "Showcase" },
      { href: "/contact", label: "Contact" },
      { href: "/status", label: "System status" },
    ],
  },
  {
    title: "Trust & Legal",
    links: [
      { href: "/security", label: "Security" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/dpa", label: "Data processing addendum" },
      { href: "/compliance", label: "Compliance (SOC 2, GDPR, HIPAA)" },
      { href: "/responsible-ai", label: "Responsible AI" },
    ],
  },
];

const BADGES = [
  { label: "SOC 2 Type II", icon: "shield-check" as const },
  { label: "GDPR", icon: "shield-check" as const },
  { label: "HIPAA-ready", icon: "shield-check" as const },
  { label: "ISO 27001", icon: "shield-check" as const },
  { label: "Encrypted at rest", icon: "lock" as const },
];

function BadgeIcon({ kind }: { kind: "shield-check" | "lock" }) {
  if (kind === "lock") {
    return (
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2.5" y="5" width="7" height="5.5" rx="1" />
        <path d="M4 5V3.5a2 2 0 1 1 4 0V5" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 1l4 2v3.5a5 5 0 0 1-4 5 5 5 0 0 1-4-5V3z" />
      <path d="M4 6l1.5 1.5L8 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-300 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* ─── BRAND + DESCRIPTION ─── */}
        <div className="grid md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="text-base font-semibold text-white">AnyFigure</span>
            </Link>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed max-w-xs">
              Vector-first scientific figures. Generated as a scene graph, every protein, arrow
              and label born editable. Built for cancer biologists, genomicists and clinicians
              who need publication-grade figures without redrawing.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {BADGES.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-emerald-300 text-[10px] font-medium border border-slate-700"
                >
                  <BadgeIcon kind={b.icon} />
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* ─── LINK COLUMNS ─── */}
          {COLUMNS.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── BOTTOM ROW ─── */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            © {year} AnyFigure Labs Inc. · Scientific figures, generated as vectors.
          </p>
          <div className="flex items-center gap-3 text-slate-500">
            <Link href="/privacy" className="text-[11px] hover:text-white">Privacy</Link>
            <span className="text-slate-700">·</span>
            <Link href="/terms" className="text-[11px] hover:text-white">Terms</Link>
            <span className="text-slate-700">·</span>
            <Link href="/security" className="text-[11px] hover:text-white">Security</Link>
            <span className="text-slate-700">·</span>
            <Link href="/cookies" className="text-[11px] hover:text-white">Cookies</Link>
            <span className="text-slate-700">·</span>
            <Link href="mailto:hello@anyfigure.dev" className="text-[11px] hover:text-white">
              hello@anyfigure.dev
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
