"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { APP_NAME, APP_TAGLINE } from "@/lib/appMeta";

function IconSpark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2l1.2 4.8L16 8l-4.8 1.2L10 14l-1.2-4.8L4 8l4.8-1.2L10 2z" />
    </svg>
  );
}

function IconCanvas({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M7 13l2.5-3 2 1.5L13 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV: {
  href: string;
  label: string;
  icon: ({ className }: { className?: string }) => React.ReactElement;
  primary?: boolean;
}[] = [
  { href: "/ai-figure-studio", label: "AI Figure Studio", icon: IconSpark, primary: true },
  { href: "/workspace", label: "Workspace", icon: IconCanvas },
];

export function MobileAppNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex-shrink-0 flex border-b border-slate-800 bg-[#0b1220]">
      {NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
              active ? "text-cyan-300 bg-cyan-500/10" : "text-slate-400"
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function StudioSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-[#0b1220] text-slate-300 flex-shrink-0 border-r border-slate-800/80">
      <div className="px-5 pt-6 pb-5 border-b border-slate-800/80">
        <Link href="/ai-figure-studio" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <svg viewBox="0 0 20 20" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="3" />
              <ellipse cx="10" cy="10" rx="8" ry="3" />
              <ellipse cx="10" cy="10" rx="8" ry="3" transform="rotate(60 10 10)" />
              <ellipse cx="10" cy="10" rx="8" ry="3" transform="rotate(-60 10 10)" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight group-hover:text-cyan-100 transition-colors">
              {APP_NAME}
            </p>
            <p className="text-[10px] text-slate-500 tracking-wide">{APP_TAGLINE}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          App
        </p>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            const cls = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              active
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent"
            }`;

            return (
              <li key={item.href}>
                <Link href={item.href} className={cls}>
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-cyan-400" : "opacity-70"}`} />
                  {item.label}
                  {item.primary && !active && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wide text-cyan-600 bg-cyan-950 px-1.5 py-0.5 rounded">
                      Start
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
