"use client";

import type { ReactNode } from "react";

interface SidebarTooltipProps {
  label: string;
  description: string;
  shortcut?: string;
  children: ReactNode;
}

export default function SidebarTooltip({ label, description, shortcut, children }: SidebarTooltipProps) {
  return (
    <div className="relative group w-full">
      {children}
      <div
        role="tooltip"
        className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-[100] w-56 rounded-lg border border-white/15 bg-[#1a2332] px-3 py-2.5 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
      >
        <p className="text-xs font-semibold text-white leading-tight">{label}</p>
        <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{description}</p>
        {shortcut && (
          <p className="text-[10px] text-indigo-300/90 mt-1.5 font-medium">{shortcut}</p>
        )}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#1a2332]" />
      </div>
    </div>
  );
}
