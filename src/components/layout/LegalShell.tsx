"use client";

import { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

interface LegalShellProps {
  title: string;
  updated: string;
  tagline?: string;
  children: ReactNode;
}

/** Page chrome for static legal / policy pages. Consistent typography,
 *  generous reading width, sticky last-updated date. */
export default function LegalShell({ title, updated, tagline, children }: LegalShellProps) {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <p className="text-[11px] uppercase tracking-wider text-indigo-600 font-semibold mb-2">
            AnyFigure · Trust Center
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{title}</h1>
          {tagline && <p className="text-base text-slate-600">{tagline}</p>}
          <p className="text-[11px] text-slate-500 mt-3">Last updated · {updated}</p>
        </div>
        <article className="prose prose-slate prose-sm max-w-none leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-slate-700 [&_p]:mb-3 [&_ul]:my-3 [&_ul]:pl-5 [&_li]:list-disc [&_li]:text-slate-700 [&_li]:mb-1 [&_strong]:text-slate-900 [&_a]:text-indigo-600 [&_a:hover]:underline">
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
