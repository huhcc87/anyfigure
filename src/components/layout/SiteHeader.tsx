"use client";

import Link from "next/link";
import { useState } from "react";

interface SiteHeaderProps {
  /** When false, hides the secondary nav (used on full-canvas pages). */
  showNav?: boolean;
}

/**
 * Top-of-page header. Sits above the AppSidebar (the left rail) on marketing /
 * home / library / projects pages. Our visual identity: indigo→teal gradient
 * brand mark, slate-900 text, white surface, generous spacing.
 */
export default function SiteHeader({ showNav = true }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900">AnyFigure</span>
        </Link>

        {showNav && (
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {[
              { href: "/", label: "Home" },
              { href: "/projects", label: "Projects" },
              { href: "/library", label: "Library" },
              { href: "/workspace", label: "Editor" },
              { href: "/pricing", label: "Pricing" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex-1" />

        <Link
          href="/security"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200"
          title="SOC 2 — view security details"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 1l4 2v3.5a5 5 0 0 1-4 5 5 5 0 0 1-4-5V3z" />
            <path d="M4 6l1.5 1.5L8 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Encrypted
        </Link>

        <Link
          href="/pricing"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold hover:bg-amber-100"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 6L5 3l5 5-3 3z" />
          </svg>
          Upgrade
        </Link>

        <Link
          href="/sign-in"
          className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
        >
          Sign in
        </Link>

        <button
          type="button"
          className="md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1">
          {[
            { href: "/", label: "Home" },
            { href: "/projects", label: "Projects" },
            { href: "/library", label: "Library" },
            { href: "/workspace", label: "Editor" },
            { href: "/pricing", label: "Pricing" },
            { href: "/security", label: "Security" },
            { href: "/privacy", label: "Privacy" },
            { href: "/sign-in", label: "Sign in" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
