"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function IconProjects() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function IconLibrary() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M6 4h12v16l-6-3-6 3V4z" />
    </svg>
  );
}

function IconCanvas() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 14l5-4 4 3 4-5 5 6" />
    </svg>
  );
}

function IconGift() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
      <rect x="2" y="7" width="20" height="5" rx="1" />
      <path d="M12 21V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: <IconHome /> },
  { href: "/projects", label: "Projects", icon: <IconProjects /> },
  { href: "/library", label: "Library", icon: <IconLibrary /> },
  { href: "/workspace", label: "Vector Canvas", icon: <IconCanvas /> },
];

/**
 * Vertical icon-only nav rail. Inspired by FigureLabs left sidebar but with
 * our own visual language: pill-shaped active state with indigo accent,
 * subtle slate icons, soft 12-pt rounded container, no labels (tooltips on
 * hover) so the canvas gets maximum horizontal real estate.
 */
export default function AppSidebar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col items-center py-4 px-2 bg-transparent z-30 fixed left-3 top-1/2 -translate-y-1/2">
      <nav className="flex flex-col gap-1 bg-white/95 backdrop-blur border border-slate-200 rounded-full py-2 px-1.5 shadow-sm">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <div key={item.href} className="relative">
              <Link
                href={item.href}
                onMouseEnter={() => setHovered(item.href)}
                onMouseLeave={() => setHovered(null)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-label={item.label}
              >
                {item.icon}
              </Link>
              {hovered === item.href && (
                <span className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
        <div className="my-1 h-px bg-slate-200 mx-2" />
        <Link
          href="#"
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
          aria-label="Upgrade"
          title="Upgrade"
        >
          <IconGift />
        </Link>
      </nav>
    </aside>
  );
}
