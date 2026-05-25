"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import type { FigurePlan } from "@/components/figures/FigureRenderer";
import { FigureViewerToolbar } from "@/components/figures/FigureViewerToolbar";
import { TextEditOverlay, type ImagePanelManifest } from "@/components/figures/TextEditOverlay";
import { EditableLabelsLayer } from "@/components/figures/EditableLabelsLayer";
import { getPanelTextManifest } from "@/lib/makeEditable/imageRegionUtils";
import { cacheEditPlan } from "@/lib/figureStore";
import { getEditableFigure, saveEditableFigure, type EditableFigureRecord } from "@/lib/makeEditable/editableFigureStore";
import { isAiImagePlan } from "@/lib/makeEditable/isAiImagePlan";
import { buildEditableRecordSync } from "@/lib/makeEditable/persistEditableAssets";
import { TEXT_MANIFEST_VERSION } from "@/lib/makeEditable/textManifestConstants";
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
  const [pendingEdits, setPendingEdits] = useState<Record<string, string>>({});
  /** Labels with applied text changes — shown as white overlays after Text Edit closes. */
  const [appliedEdits, setAppliedEdits] = useState<Record<string, string>>({});
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

  useEffect(() => {
    const fromPlan: Record<string, string> = {};
    for (const p of displayPlan.panels ?? []) {
      for (const r of p.textNodesManifest?.regions ?? []) {
        if (r.userEdited) fromPlan[r.id] = r.text;
      }
    }
    setAppliedEdits(fromPlan);
  }, [displayPlan.panels]);

  const aiImage = isAiImagePlan(displayPlan);
  const hasAnyImage = displayPlan.panels?.some((p) => !!p.imageUrl) ?? false;
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
                regions: p.textNodesManifest.regions.map((r) =>
                  r.id === id
                    ? { ...r, text, userEdited: true, originalText: r.originalText ?? r.text }
                    : r
                ),
              },
            };
          });
        }
        void cacheEditPlan(figureId, next);
        onPlanUpdate?.(next);
        persistEditable();
        setAppliedEdits((prev) => ({ ...prev, ...edits }));
        setPendingEdits({});
        return next;
      });
    },
    [figureId, onPlanUpdate, persistEditable]
  );

  const rescanLabels = useCallback(async () => {
    if (!hasAnyImage) return;
    setDetectingLabels(true);
    try {
      const res = await fetch("/api/ai/extract-text-regions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: displayPlan, force: true }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "ok") {
        toast.error(data.error || "Re-scan failed.");
        return;
      }
      const enriched = data.plan as FigurePlan;
      setDisplayPlan(enriched);
      onPlanUpdate?.(enriched);
      await cacheEditPlan(figureId, enriched);
      setPendingEdits({});
      const rec = buildEditableRecordSync(figureId, enriched, pngUrl);
      setEditable(rec);
      await saveEditableFigure(rec);
      toast.success(`Re-scanned ${data.labelCount ?? 0} labels`);
    } catch (err) {
      console.error("[text-edit] rescan failed:", err);
      toast.error("Re-scan failed.");
    } finally {
      setDetectingLabels(false);
    }
  }, [hasAnyImage, displayPlan, figureId, onPlanUpdate, pngUrl]);

  const handleTextEditToggle = useCallback(
    async (active: boolean) => {
      setTextEditActive(active);
      if (!active) {
        setPendingEdits({});
        return;
      }
      if (!hasAnyImage) return;

      if (hasDetectedLabels) {
        const stale = displayPlan.panels?.some(
          (p) => p.textNodesManifest?.regions?.length && p.textNodesManifest.manifestVersion !== TEXT_MANIFEST_VERSION
        );
        if (!stale) return;
      }

      setDetectingLabels(true);
      try {
        const planForApi = {
          ...displayPlan,
          panels: displayPlan.panels?.map((p) => ({
            ...p,
            imageUrl: p.imageUrl && p.imageUrl.length > 500 ? p.imageUrl : p.imageUrl,
          })),
        };
        const res = await fetch("/api/ai/extract-text-regions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planForApi, force: !hasDetectedLabels }),
        });
        if (!res.ok) {
          const text = await res.text();
          let msg = "Could not detect diagram labels.";
          try { msg = JSON.parse(text).error || msg; } catch { /* use default */ }
          toast.error(msg);
          return;
        }
        const data = await res.json();
        if (data.status !== "ok") {
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
    [hasAnyImage, hasDetectedLabels, displayPlan, figureId, onPlanUpdate, pngUrl]
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
        hasEditableLayer={hasEditable || hasAnyImage}
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

        {/* Label overlays only during Text Edit — avoids ghost text over the raster image */}
        {hasDetectedLabels &&
          !textEditActive &&
          Object.keys(appliedEdits).length > 0 &&
          previewEl &&
          imageManifests.map(({ panelId, manifest }) => (
            <EditableLabelsLayer
              key={panelId}
              container={previewEl}
              panelId={panelId}
              manifest={manifest}
              edits={appliedEdits}
              onlyIds={Object.keys(appliedEdits)}
            />
          ))}

        <TextEditOverlay
          active={textEditActive}
          loading={detectingLabels}
          domContainer={previewEl}
          imageManifests={imageManifests}
          diagramOnly={hasAnyImage}
          showDiagramHint={hasAnyImage && !hasDetectedLabels && !detectingLabels}
          textNodes={editable?.textNodes ?? null}
          svgContent={editable?.svg ?? null}
          figureId={figureId}
          onDomApply={handleDomApply}
          onApplied={handleApplied}
          onRetry={() => void handleTextEditToggle(true)}
          onEditsChange={setPendingEdits}
          onRescan={hasAnyImage ? () => void rescanLabels() : undefined}
          committedEdits={appliedEdits}
          onBboxNudge={(panelId, regionId, dx, dy) => {
            // Convert DOM-pixel drag delta back to image-pixel delta using the
            // same scale used to render the manifest, then persist into the plan.
            setDisplayPlan((prev) => {
              if (!prev.panels) return prev;
              const nextPanels = prev.panels.map((p) => {
                const pid = p.id || p.label || "main";
                if (pid !== panelId || !p.textNodesManifest) return p;
                // Look up the rendered image to derive DOM→pixel scale
                const img =
                  (previewEl?.querySelector(`[data-figure-image="${pid}"]`) as HTMLImageElement | null) ||
                  (previewEl?.querySelector("[data-figure-image]") as HTMLImageElement | null);
                if (!img || img.naturalWidth === 0) return p;
                const layout = img.getBoundingClientRect();
                const scale = Math.min(
                  layout.width / img.naturalWidth,
                  layout.height / img.naturalHeight
                );
                if (!scale) return p;
                const pdx = dx / scale;
                const pdy = dy / scale;
                return {
                  ...p,
                  textNodesManifest: {
                    ...p.textNodesManifest,
                    regions: p.textNodesManifest.regions.map((r) =>
                      r.id === regionId
                        ? {
                            ...r,
                            bbox: [
                              Math.max(0, Math.round(r.bbox[0] + pdx)),
                              Math.max(0, Math.round(r.bbox[1] + pdy)),
                              r.bbox[2],
                              r.bbox[3],
                            ] as typeof r.bbox,
                            userPositioned: true,
                          }
                        : r
                    ),
                  },
                };
              });
              const nextPlan: FigurePlan = { ...prev, panels: nextPanels };
              void cacheEditPlan(figureId, nextPlan);
              onPlanUpdate?.(nextPlan);
              return nextPlan;
            });
          }}
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
