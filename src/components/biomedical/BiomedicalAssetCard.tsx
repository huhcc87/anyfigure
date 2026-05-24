"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, Eye } from "lucide-react";
import type { BiomedicalAsset } from "@/types/biomedicalAssets";
import { BIOMEDICAL_CATEGORY_COLORS } from "@/types/biomedicalAssets";
import { cn } from "@/lib/utils";

interface BiomedicalAssetCardProps {
  asset: BiomedicalAsset;
  isFavorite: boolean;
  onAdd: (asset: BiomedicalAsset) => void;
  onPreview: (asset: BiomedicalAsset) => void;
  onToggleFavorite: (assetId: string) => void;
}

function BiomedicalAssetCard({
  asset,
  isFavorite,
  onAdd,
  onPreview,
  onToggleFavorite,
}: BiomedicalAssetCardProps) {
  const color = BIOMEDICAL_CATEGORY_COLORS[asset.category] ?? "#6366f1";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative aspect-square rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/15 transition-colors"
    >
      <button
        type="button"
        onClick={() => onAdd(asset)}
        className="w-full h-full flex flex-col items-center justify-center gap-1 p-1.5"
        title={`Add ${asset.name}`}
      >
        <span className="text-2xl leading-none">{asset.emoji || "⬡"}</span>
        <span className="text-[9px] font-medium text-zinc-500 group-hover:text-zinc-300 truncate w-full text-center px-0.5 leading-tight">
          {asset.name}
        </span>
      </button>

      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPreview(asset); }}
          className="w-5 h-5 rounded bg-black/50 flex items-center justify-center text-zinc-300 hover:text-white"
          title="Preview"
        >
          <Eye className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset.id); }}
          className={cn(
            "w-5 h-5 rounded bg-black/50 flex items-center justify-center",
            isFavorite ? "text-rose-400" : "text-zinc-400 hover:text-rose-300"
          )}
          title={isFavorite ? "Remove favorite" : "Favorite"}
        >
          <Heart className="w-3 h-3" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg opacity-60"
        style={{ backgroundColor: color }}
      />

      <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Plus className="w-3 h-3 text-indigo-400" />
      </div>
    </motion.div>
  );
}

export default memo(BiomedicalAssetCard);
