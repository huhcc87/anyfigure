"use client";

import type { BiomedicalAssetCategory } from "@/types/biomedicalAssets";
import { BIOMEDICAL_CATEGORY_COLORS, BIOMEDICAL_CATEGORY_LABELS } from "@/types/biomedicalAssets";
import { cn } from "@/lib/utils";

const CORE_CATEGORIES: (BiomedicalAssetCategory | "all" | "favorites" | "recent")[] = [
  "all",
  "favorites",
  "recent",
  "dna-rna",
  "proteins",
  "cells",
  "bacteria",
  "immune-cells",
  "tumor-cells",
  "organs",
  "crispr",
  "sequencing",
  "pathways",
  "microbiome",
  "lab-equipment",
  "molecules",
  "viruses",
  "tissues",
  "clinical",
  "networks",
];

interface BiomedicalAssetCategoryTabsProps {
  active: BiomedicalAssetCategory | "all" | "favorites" | "recent";
  onChange: (cat: BiomedicalAssetCategory | "all" | "favorites" | "recent") => void;
  counts: Partial<Record<BiomedicalAssetCategory | "all" | "favorites" | "recent", number>>;
}

export default function BiomedicalAssetCategoryTabs({ active, onChange, counts }: BiomedicalAssetCategoryTabsProps) {
  const label = (cat: typeof active) => {
    if (cat === "all") return "All";
    if (cat === "favorites") return "★ Favorites";
    if (cat === "recent") return "Recent";
    return BIOMEDICAL_CATEGORY_LABELS[cat];
  };

  return (
    <div className="flex gap-1 flex-wrap max-h-28 overflow-y-auto pr-1">
      {CORE_CATEGORIES.map((cat) => {
        const color = cat !== "all" && cat !== "favorites" && cat !== "recent"
          ? BIOMEDICAL_CATEGORY_COLORS[cat]
          : "#6366f1";
        const isActive = active === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              "px-2 py-1 rounded-full text-[10px] font-medium transition-all flex-shrink-0 border",
              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300 bg-white/5 border-transparent hover:border-white/10"
            )}
            style={
              isActive
                ? { backgroundColor: `${color}25`, color, borderColor: `${color}50` }
                : undefined
            }
          >
            {label(cat)}
            {counts[cat] !== undefined && cat !== "all" && (
              <span className="ml-1 opacity-70">{counts[cat]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
