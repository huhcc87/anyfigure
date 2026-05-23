"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface TemplateCardData {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  gradient: string;
  panels: number;
  popular?: boolean;
  new?: boolean;
}

interface TemplateCardProps {
  template: TemplateCardData;
  className?: string;
  onUse?: (id: string) => void;
}

export default function TemplateCard({ template, className, onUse }: TemplateCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-[#0F1629] border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10",
        className
      )}
    >
      {/* Preview area */}
      <div className="relative h-44 overflow-hidden" style={{ background: template.gradient }}>
        {/* Mock figure preview */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-2 p-4 w-full max-w-[200px]">
            {Array.from({ length: Math.min(template.panels, 4) }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded bg-white/10 border border-white/10 flex items-center justify-center text-white/30 text-xs font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {template.popular && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/20 backdrop-blur-sm">
              Popular
            </span>
          )}
          {template.new && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 backdrop-blur-sm">
              New
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onUse?.(template.id)}
            className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-colors"
          >
            Use Template
          </button>
          <button className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors backdrop-blur-sm">
            Preview
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-white leading-tight">{template.name}</h3>
          <span className="text-xs text-zinc-600 flex-shrink-0 mt-0.5">{template.panels}p</span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-2.5">
          {template.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-zinc-500 border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
