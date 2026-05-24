"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import type { FigurePlan } from "@/components/figures/FigureRenderer";
import { FigureViewerToolbar } from "@/components/figures/FigureViewerToolbar";
import { TextEditOverlay, type ImagePanelManifest } from "@/components/figures/TextEditOverlay";
import { getPanelTextManifest } from "@/lib/makeEditable/imageRegionUtils";
import { cacheEditPlan } from "@/lib/figureStore";
import { getEditableFigure, saveEditableFigure, type EditableFigureRecord } from "@/lib/makeEditable/editableFigureStore";
import { isAiImagePlan } from "@/lib/makeEditable/isAiImagePlan";
import { buildEditableRecordSync } from "@/lib/makeEditable/persistEditableAssets";
import type { TextNodesDocument } from "@/types/editableFigure";

const FigureRenderer = dynamic(() => import("@/components/figures/FigureRenderer"), { ssr: false });

interface FigureViewerCardProps {
  figureId: string;
  prompt: string;
  panels: number;
  mode?: string;
  timestamp: string;
  plan: FigurePlan;
  editableReady?: boolean;
  isEnriching?: boolean;
  enrichProgress?: string;
  onExportPng: () => void;
  onExportPptx: () => void;
  onDelete: () => void;
  onOpenInStudio: () => void;
  canOpenInStudio: boolean;
  onEditableReady?: (urls: { svgUrl: string; textNodesUrl: string; editableReady: true }) => void;
  onPlanUpdate?: (plan: FigurePlan) => void;
}

function isValidEditable(rec: EditableFigureRecord | null | undefined): rec is EditableFigureRecord {
  return !!rec?.textNodes?.nodes?.length && !!rec.svg;
}

export function FigureViewerCard({
  figureId,
  prompt,
  panels,
  mode,
  timestamp,
  plan,
  editableReady = false,
  isEnriching,
  enrichProgress,
  onExportPng,
  onExportPptx,
  onDelete,
  onOpenInStudio,
  canOpenInStudio,
  onEditableReady,
  onPlanUpdate,
}: FigureViewerCardProps) {
  const [textEditActive, setTextEditActive] = useState(false);
  const [detectingLabels, setDetectingLabels] = useState(false);
  const [whiteBackground, setWhiteBackground] = useState(true);
  const [displayPlan, setDisplayPlan] = useState(plan);
  const [editable, setEditable] = useState<EditableFigureRecord | null>(null);
  const [previewEl, setPreviewEl] = useState<HTMLDivElement | null>(null);

  const onEditableReadyRef = useRef(onEditableReady);
  const editableReadyRef = useRef(editableReady);
  onEditableReadyRef.current = onEditableReady;
  editableReadyRef.current = editableReady;

  useEffect(() => {
    setDisplayPlan(plan);
  }, [plan]);

  const aiImage = isAiImagePlan(displayPlan);
  const pngUrl = displayPlan.panels?.find((p) => p.imageUrl)?.imageUrl;
  const hasDetectedLabels = displayPlan.panels?.some((p) => (p.textNodesManifest?.regions.length ?? 0) > 0);

  const imageManifests = useMemo<ImagePanelManifest[]>(
    () =>
      (displayPlan.panels ?? [])
        .map((p) => {
          const manifest = getPanelTextManifest(p);
          if (!p.imageUrl || !manifest?.regions.length) return null;
          return {
            panelId: p.id || p.label || "main",
            manifest,
          };
        })
        .filter((m): m is ImagePanelManifest => m !== null),
    [displayPlan.panels]
  );

  const persistEditable = useCallback(() => {
    if (isEnriching || !displayPlan.panels?.length) return;
    try {
      const rec = buildEditableRecordSync(figureId, displayPlan, pngUrl);
      if (isValidEditable(rec)) {
        setEditable(rec);
        if (!editableReadyRef.current) {
          onEditableReadyRef.current?.({
            svgUrl: rec.svgDataUrl,
            textNodesUrl: rec.textNodesUrl,
            editableReady: true,
          });
          editableReadyRef.current = true;
        }
        void saveEditableFigure(rec);
      }
    } catch (err) {
      console.error("[editable] build failed:", err);
    }
  }, [figureId, displayPlan, pngUrl, isEnriching]);

  useEffect(() => {
    if (isEnriching) return;
    void (async () => {
      const cached = await getEditableFigure(figureId);
      if (isValidEditable(cached)) {
        setEditable(cached);
        return;
      }
      persistEditable();
    })();
  }, [figureId, isEnriching, persistEditable]);

  const handleDomApply = useCallback(
    (edits: Record<string, string>) => {
      setDisplayPlan((prev) => {
        const next: FigurePlan = {
          ...prev,
          panels: prev.panels
            ? prev.panels.map((p) => ({
                ...p,
                textNodesManifest: p.textNodesManifest
                  ? { ...p.textNodesManifest, regions: [...p.textNodesManifest.regions] }
                  : undefined,
              }))
            : [],
        };
        if (edits.title) next.title = edits.title;
        if (edits.legend) next.legend = edits.legend;
        if (edits.caption && next.panels?.[0]) {
          next.panels[0] = { ...next.panels[0], description: edits.caption };
        }
        for (const [id, text] of Object.entries(edits)) {
          if (id === "title" || id === "legend" || id === "caption") continue;
          next.panels = next.panels?.map((p) => {
            if (!p.textNodesManifest) return p;
            return {
              ...p,
              textNodesManifest: {
                ...p.textNodesManifest,
                regions: p.textNodesManifest.regions.map((r) => (r.id === id ? { ...r, text } : r)),
              },
            };
          });
        }
        void cacheEditPlan(figureId, next);
        onPlanUpdate?.(next);
        persistEditable();
        return next;
      });
    },
    [figureId, onPlanUpdate, persistEditable]
  );

  const handleTextEditToggle = useCallback(
    async (active: boolean) => {
      setTextEditActive(active);
      if (!active || !aiImage || hasDetectedLabels) return;

      setDetectingLabels(true);
      try {
        const res = await fetch("/api/ai/extract-text-regions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: displayPlan, force: !hasDetectedLabels }),
        });
        const data = await res.json();
        if (!res.ok || data.status !== "ok") {
          toast.error(data.error || "Could not detect diagram labels.");
          return;
        }
        const enriched = data.plan as FigurePlan;
        setDisplayPlan(enriched);
        onPlanUpdate?.(enriched);
        await cacheEditPlan(figureId, enriched);
        try {
          const rec = buildEditableRecordSync(figureId, enriched, pngUrl);
          setEditable(rec);
          await saveEditableFigure(rec);
        } catch (err) {
          console.error("[text-edit] editable build failed:", err);
        }
        toast.success(`Detected ${data.labelCount ?? 0} editable labels`);
      } catch (err) {
        console.error("[text-edit] label detection failed:", err);
        toast.error(err instanceof Error ? err.message : "Label detection failed.");
      } finally {
        setDetectingLabels(false);
      }
    },
    [aiImage, hasDetectedLabels, displayPlan, figureId, onPlanUpdate, pngUrl]
  );

  const handleApplied = useCallback((svgContent: string, textNodes: TextNodesDocument) => {
    setEditable((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        svg: svgContent,
        textNodes,
        convertedAt: Date.now(),
      };
      void saveEditableFigure(next);
      return next;
    });
  }, []);

  const hasEditable = isValidEditable(editable);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {isEnriching && enrichProgress && (
        <div className="px-4 py-2 bg-teal-50 border-b border-teal-100 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-xs text-teal-800">{enrichProgress}</p>
        </div>
      )}

      <FigureViewerToolbar
        figureId={figureId}
        plan={displayPlan}
        textEditActive={textEditActive}
        onTextEditToggle={(active) => void handleTextEditToggle(active)}
        whiteBackground={whiteBackground}
        onWhiteBgToggle={() => setWhiteBackground((v) => !v)}
        onExport={onExportPng}
        onExportPng={onExportPng}
        onExportPptx={onExportPptx}
        hasEditableLayer={hasEditable || aiImage}
        onPlanUpdate={(updated) => {
          setDisplayPlan(updated);
          onPlanUpdate?.(updated);
        }}
      />

      <div
        id={`figure-export-${figureId}`}
        ref={setPreviewEl}
        className={`relative p-4 ${whiteBackground ? "bg-white" : "bg-slate-100"}`}
      >
        <FigureRenderer
          plan={displayPlan}
          whiteBackground={whiteBackground}
          preview
          enriching={isEnriching}
        />

        <TextEditOverlay
          active={textEditActive}
          loading={detectingLabels}
          domContainer={previewEl}
          imageManifests={imageManifests}
          diagramOnly={aiImage}
          showDiagramHint={aiImage && !hasDetectedLabels && !detectingLabels}
          textNodes={editable?.textNodes ?? null}
          svgContent={editable?.svg ?? null}
          figureId={figureId}
          onDomApply={handleDomApply}
          onApplied={handleApplied}
          onRetry={() => void handleTextEditToggle(true)}
        />
      </div>

      <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-black truncate">{displayPlan.title || prompt}</p>
          <p className="text-xs text-gray-700">
            {panels} panels · {mode || "smart"} · {new Date(timestamp).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenInStudio}
            disabled={!canOpenInStudio}
            className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-md cursor-pointer"
          >
            Open in Studio
          </button>
          <button type="button" onClick={onDelete} className="text-xs text-gray-600 hover:text-red-500 px-1 cursor-pointer">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
