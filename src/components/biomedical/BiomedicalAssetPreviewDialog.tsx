"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import type { BiomedicalAsset } from "@/types/biomedicalAssets";
import { BIOMEDICAL_CATEGORY_LABELS, BIOMEDICAL_CATEGORY_COLORS } from "@/types/biomedicalAssets";

interface BiomedicalAssetPreviewDialogProps {
  asset: BiomedicalAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (asset: BiomedicalAsset) => void;
  onOpenMolecule?: (asset: BiomedicalAsset) => void;
  onOpenNetwork?: (asset: BiomedicalAsset) => void;
}

export default function BiomedicalAssetPreviewDialog({
  asset,
  open,
  onOpenChange,
  onAdd,
  onOpenMolecule,
  onOpenNetwork,
}: BiomedicalAssetPreviewDialogProps) {
  if (!asset) return null;
  const color = BIOMEDICAL_CATEGORY_COLORS[asset.category];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[200]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-sm bg-[#0F1629] border border-white/15 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-sm font-bold text-white">{asset.name}</Dialog.Title>
              {asset.scientificName && (
                <p className="text-[11px] text-zinc-500 italic mt-0.5">{asset.scientificName}</p>
              )}
            </div>
            <Dialog.Close className="text-zinc-500 hover:text-white p-1">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div
            className="flex items-center justify-center h-32 rounded-xl mb-4 border border-white/10"
            style={{ backgroundColor: `${color}15` }}
          >
            <span className="text-5xl">{asset.emoji || "⬡"}</span>
          </div>

          <p
            className="text-[10px] font-semibold uppercase tracking-wide mb-2"
            style={{ color }}
          >
            {BIOMEDICAL_CATEGORY_LABELS[asset.category]}
          </p>

          {asset.description && (
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{asset.description}</p>
          )}

          <div className="flex flex-wrap gap-1 mb-4">
            {asset.tags.slice(0, 6).map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => { onAdd(asset); onOpenChange(false); }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add to canvas
            </button>
            {(asset.assetType === "molecule" || asset.assetType === "3d") && onOpenMolecule && (
              <button
                type="button"
                onClick={() => { onOpenMolecule(asset); onOpenChange(false); }}
                className="w-full py-2 text-xs font-medium rounded-xl border border-white/15 text-zinc-300 hover:bg-white/5"
              >
                Open 3D molecular viewer
              </button>
            )}
            {(asset.assetType === "node" || asset.category === "networks") && onOpenNetwork && (
              <button
                type="button"
                onClick={() => { onOpenNetwork(asset); onOpenChange(false); }}
                className="w-full py-2 text-xs font-medium rounded-xl border border-white/15 text-zinc-300 hover:bg-white/5"
              >
                Open network viewer
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
