"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Tabs from "@radix-ui/react-tabs";
import type { BiomedicalAsset, BiomedicalAssetCategory } from "@/types/biomedicalAssets";
import {
  filterBiomedicalAssets,
  getFavoriteAssets,
  getFavoriteIds,
  getRecentAssets,
  getAssetCount,
  toggleFavorite,
  recordRecentUse,
  isFavorite,
} from "@/services/biomedicalAssetService";
import BiomedicalAssetSearch from "@/components/biomedical/BiomedicalAssetSearch";
import BiomedicalAssetCategoryTabs from "@/components/biomedical/BiomedicalAssetCategoryTabs";
import BiomedicalAssetCard from "@/components/biomedical/BiomedicalAssetCard";
import BiomedicalAssetPreviewDialog from "@/components/biomedical/BiomedicalAssetPreviewDialog";
import type { PathwayTemplate } from "@/data/biomedicalPathwayTemplates";

const PathwayBuilder = dynamic(() => import("@/components/biomedical/BiomedicalPathwayBuilder"), {
  ssr: false,
  loading: () => <PanelLoader label="Loading pathway builder…" />,
});

const MolecularViewer = dynamic(() => import("@/components/biomedical/MolecularViewer"), {
  ssr: false,
  loading: () => <PanelLoader label="Loading 3D viewer…" />,
});

const NetworkViewer = dynamic(() => import("@/components/biomedical/BiomedicalNetworkViewer"), {
  ssr: false,
  loading: () => <PanelLoader label="Loading network viewer…" />,
});

const PAGE_SIZE = 24;

function PanelLoader({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-xs text-zinc-500">
      <span className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mr-2" />
      {label}
    </div>
  );
}

interface BiomedicalAssetsPanelProps {
  onInsert: (asset: BiomedicalAsset) => void;
  onInsertPathway?: (template: PathwayTemplate) => void;
}

export default function BiomedicalAssetsPanel({ onInsert, onInsertPathway }: BiomedicalAssetsPanelProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BiomedicalAssetCategory | "all" | "favorites" | "recent">("all");
  const [page, setPage] = useState(1);
  const [previewAsset, setPreviewAsset] = useState<BiomedicalAsset | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [favVersion, setFavVersion] = useState(0);
  const [moleculePdb, setMoleculePdb] = useState("4OO8");
  const [panelTab, setPanelTab] = useState("assets");

  const filtered = useMemo(() => {
    void favVersion;
    if (category === "favorites") return getFavoriteAssets();
    if (category === "recent") return getRecentAssets();
    return filterBiomedicalAssets(query, category);
  }, [query, category, favVersion]);

  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = visible.length < filtered.length;

  const counts = useMemo(() => {
    void favVersion;
    return {
      all: getAssetCount(),
      favorites: getFavoriteIds().length,
      recent: getRecentAssets().length,
    };
  }, [favVersion]);

  const handleAdd = useCallback((asset: BiomedicalAsset) => {
    recordRecentUse(asset.id);
    onInsert(asset);
    setFavVersion((v) => v + 1);
  }, [onInsert]);

  const handleToggleFavorite = useCallback((assetId: string) => {
    toggleFavorite(assetId);
    setFavVersion((v) => v + 1);
  }, []);

  const handlePreview = useCallback((asset: BiomedicalAsset) => {
    setPreviewAsset(asset);
    setPreviewOpen(true);
  }, []);

  const handleOpenMolecule = useCallback((asset: BiomedicalAsset) => {
    const pdb = (asset.metadata?.pdbId as string) || "4OO8";
    setMoleculePdb(pdb);
    setPanelTab("molecule");
  }, []);

  const handleOpenNetwork = useCallback(() => {
    setPanelTab("network");
  }, []);

  return (
    <div className="w-80 h-full bg-[#0C1120] border-r border-white/10 flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-white/10">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-0.5">
          Biomedical Assets
        </h3>
        <p className="text-[10px] text-zinc-600 mb-3">{getAssetCount()}+ research icons · click to add</p>

        <Tabs.Root value={panelTab} onValueChange={setPanelTab}>
          <Tabs.List className="flex gap-0.5 mb-3 bg-white/5 rounded-lg p-0.5">
            {[
              { id: "assets", label: "Assets" },
              { id: "pathways", label: "Pathways" },
              { id: "molecule", label: "3D" },
              { id: "network", label: "Network" },
            ].map((t) => (
              <Tabs.Trigger
                key={t.id}
                value={t.id}
                className="flex-1 py-1.5 text-[10px] font-medium rounded-md text-zinc-500 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 transition-colors"
              >
                {t.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="assets" className="outline-none">
            <BiomedicalAssetSearch
              value={query}
              onChange={(v) => { setQuery(v); setPage(1); }}
              resultCount={filtered.length}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {panelTab === "assets" && (
        <>
          <div className="px-3 pb-2 border-b border-white/10">
            <BiomedicalAssetCategoryTabs
              active={category}
              onChange={(c) => { setCategory(c); setPage(1); }}
              counts={counts}
            />
          </div>

          <ScrollArea.Root className="flex-1 overflow-hidden">
            <ScrollArea.Viewport className="h-full w-full">
              <div className="p-2">
                {visible.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <p className="text-xs text-zinc-500">No assets found</p>
                    <p className="text-[10px] text-zinc-600 mt-1">Try a different search or category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {visible.map((asset) => (
                      <BiomedicalAssetCard
                        key={asset.id}
                        asset={asset}
                        isFavorite={isFavorite(asset.id)}
                        onAdd={handleAdd}
                        onPreview={handlePreview}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )}
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="w-full mt-3 py-2 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400"
                  >
                    Load more ({filtered.length - visible.length} remaining)
                  </button>
                )}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" className="w-1.5 bg-white/5">
              <ScrollArea.Thumb className="bg-white/20 rounded-full" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </>
      )}

      {panelTab === "pathways" && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <PathwayBuilder onInsertPathway={onInsertPathway} />
        </div>
      )}

      {panelTab === "molecule" && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <MolecularViewer initialPdbId={moleculePdb} />
        </div>
      )}

      {panelTab === "network" && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <NetworkViewer />
        </div>
      )}

      <BiomedicalAssetPreviewDialog
        asset={previewAsset}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onAdd={handleAdd}
        onOpenMolecule={handleOpenMolecule}
        onOpenNetwork={handleOpenNetwork}
      />
    </div>
  );
}
