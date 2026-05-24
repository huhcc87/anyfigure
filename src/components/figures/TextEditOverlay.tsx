"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { TextNode, TextNodesDocument } from "@/types/editableFigure";
import type { TextRegionEntry, TextRegionManifest } from "@/types/detectedText";
import { mapPixelBboxToDomRect } from "@/lib/makeEditable/imageRegionUtils";

export interface ImagePanelManifest {
  panelId: string;
  manifest: TextRegionManifest;
}

interface TextEditOverlayProps {
  active: boolean;
  loading?: boolean;
  failed?: boolean;
  domContainer?: HTMLElement | null;
  /** Pixel manifests mapped onto figure images (diagram labels only). */
  imageManifests?: ImagePanelManifest[];
  /** When true, skip title/caption DOM chrome — only diagram image labels. */
  diagramOnly?: boolean;
  showDiagramHint?: boolean;
  textNodes?: TextNodesDocument | null;
  svgContent?: string | null;
  figureId?: string;
  onApplied?: (svgContent: string, textNodes: TextNodesDocument) => void;
  onDomApply?: (edits: Record<string, string>) => void;
  onRetry?: () => void;
}

function measureImageManifests(container: HTMLElement, manifests: ImagePanelManifest[]): TextNode[] {
  const containerRect = container.getBoundingClientRect();
  const nodes: TextNode[] = [];

  for (const { panelId, manifest } of manifests) {
    if (!manifest.regions.length) continue;
    const img =
      (container.querySelector(`[data-figure-image="${panelId}"]`) as HTMLImageElement | null) ||
      (container.querySelector("[data-figure-image]") as HTMLImageElement | null);
    if (!img) continue;

    for (const r of manifest.regions) {
      const layout = mapPixelBboxToDomRect(r.bbox, img, containerRect, manifest.imageWidth, manifest.imageHeight);
      nodes.push({
        id: r.id,
        text: r.text,
        bbox: { x: layout.x, y: layout.y, w: layout.w, h: layout.h },
        role: "detected",
        panel_id: panelId,
      });
    }
  }

  return nodes;
}

function measureDomNodes(
  container: HTMLElement,
  imageManifests: ImagePanelManifest[] = [],
  diagramOnly = false
): TextNode[] {
  const imageNodes = measureImageManifests(container, imageManifests);
  if (diagramOnly) return imageNodes;

  const containerRect = container.getBoundingClientRect();
  const chrome: TextNode[] = [];
  container.querySelectorAll("[data-editable-id]").forEach((el) => {
    const id = el.getAttribute("data-editable-id");
    if (!id) return;
    const text = (el.textContent || "").trim();
    if (!text) return;
    const r = el.getBoundingClientRect();
    chrome.push({
      id,
      text,
      bbox: {
        x: r.left - containerRect.left,
        y: r.top - containerRect.top,
        w: Math.max(r.width, 24),
        h: Math.max(r.height, 18),
      },
      role: id,
    });
  });

  return [...chrome, ...imageNodes];
}

function updateManifestText(manifest: TextRegionManifest, id: string, text: string): TextRegionManifest {
  return {
    ...manifest,
    regions: manifest.regions.map((r) => (r.id === id ? { ...r, text } : r)),
  };
}

export { updateManifestText };

export const TextEditOverlay = memo(function TextEditOverlay({
  active,
  loading = false,
  failed = false,
  domContainer,
  imageManifests = [],
  diagramOnly = false,
  showDiagramHint = false,
  textNodes = null,
  svgContent = null,
  figureId = "",
  onApplied,
  onDomApply,
  onRetry,
}: TextEditOverlayProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState(false);
  const [domNodes, setDomNodes] = useState<TextNode[]>([]);

  const useDom = !!domContainer;

  useEffect(() => {
    if (!active || !domContainer) {
      setDomNodes([]);
      return;
    }
    const measure = () => setDomNodes(measureDomNodes(domContainer, imageManifests, diagramOnly));
    measure();
    const imgs = domContainer.querySelectorAll("[data-figure-image]");
    imgs.forEach((img) => img.addEventListener("load", measure));
    const ro = new ResizeObserver(measure);
    ro.observe(domContainer);
    imgs.forEach((img) => ro.observe(img));
    return () => {
      ro.disconnect();
      imgs.forEach((img) => img.removeEventListener("load", measure));
    };
  }, [active, domContainer, imageManifests, diagramOnly]);

  const nodes = useDom ? domNodes : (textNodes?.nodes ?? []);
  const canvasWidth = useDom ? domContainer?.clientWidth ?? 1 : (textNodes?.canvasWidth ?? 1200);
  const canvasHeight = useDom ? domContainer?.clientHeight ?? 1 : (textNodes?.canvasHeight ?? 900);
  const editedCount = Object.keys(edits).length;

  const handleSelect = useCallback(
    (node: TextNode) => {
      setSelectedId(node.id);
      setDraft(edits[node.id] ?? node.text);
    },
    [edits]
  );

  const saveEdit = useCallback(() => {
    if (!selectedId) return;
    setEdits((prev) => ({ ...prev, [selectedId]: draft }));
    setSelectedId(null);
  }, [selectedId, draft]);

  const handleApply = useCallback(async () => {
    if (editedCount === 0) return;

    if (useDom && onDomApply) {
      setApplying(true);
      try {
        onDomApply(edits);
        toast.success("Text edits applied.");
        setEdits({});
      } finally {
        setApplying(false);
      }
      return;
    }

    if (!svgContent || !textNodes || !figureId) return;
    setApplying(true);
    try {
      const payload = Object.entries(edits).map(([id, newText]) => ({ id, newText }));
      const res = await fetch(`/api/figures/${figureId}/text-edits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits: payload, svgContent, textNodes }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "ok") {
        toast.error("Failed to apply text edits.");
        return;
      }
      toast.success("Text edits applied.");
      setEdits({});
      onApplied?.(data.svgContent, data.textNodes);
    } catch (err) {
      console.error("[text-edits] failed:", err);
      toast.error("Failed to apply text edits.");
    } finally {
      setApplying(false);
    }
  }, [editedCount, useDom, onDomApply, edits, svgContent, textNodes, figureId, onApplied]);

  if (!active) return null;

  if (loading) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 pointer-events-auto">
        <div className="flex flex-col items-center gap-3">
          <span className="w-6 h-6 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-700">Detecting diagram labels with AI…</p>
        </div>
      </div>
    );
  }

  if (!useDom && (failed || !nodes.length)) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 pointer-events-auto">
        <div className="max-w-sm mx-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
          <p className="text-sm font-medium text-amber-900">Text edit unavailable</p>
          <p className="text-xs text-amber-800 mt-1">Run <strong>Make Editable</strong> to detect diagram labels.</p>
          {onRetry && (
            <button type="button" className="mt-3 text-xs font-semibold text-teal-700 cursor-pointer" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (useDom && !nodes.length) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <p className="text-xs text-slate-500 bg-white/90 px-3 py-1.5 rounded-full border border-slate-200">
          No editable text regions found on this figure.
        </p>
      </div>
    );
  }

  return (
    <>
      {showDiagramHint && (
        <div className="absolute top-2 left-2 z-20 pointer-events-none">
          <p className="text-[10px] text-slate-600 bg-white/95 px-2.5 py-1 rounded-full border border-slate-200 shadow-sm max-w-[240px] leading-snug">
            Click a blue box to edit a diagram label
          </p>
        </div>
      )}

      {useDom ? (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {nodes.map((node) => {
            const { x, y, w, h } = node.bbox;
            const isSelected = selectedId === node.id;
            const isEdited = node.id in edits;
            return (
              <button
                key={node.id}
                type="button"
                className={`absolute rounded border pointer-events-auto cursor-text transition-colors ${
                  isSelected
                    ? "border-teal-500 border-2 bg-teal-500/10"
                    : isEdited
                      ? "border-amber-400 border-2 bg-amber-50/50"
                      : "border-sky-400/70 border bg-sky-50/30 hover:border-sky-500"
                }`}
                style={{ left: x, top: y, width: w, height: h }}
                onClick={() => handleSelect(node)}
                title={edits[node.id] ?? node.text}
              />
            );
          })}
        </div>
      ) : (
        <svg
          className="absolute inset-0 w-full h-full z-10"
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ pointerEvents: "none" }}
        >
          {nodes.map((node) => {
            const { x, y, w, h } = node.bbox;
            const isSelected = selectedId === node.id;
            const isEdited = node.id in edits;
            return (
              <rect
                key={node.id}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={3}
                fill={isSelected ? "rgba(20, 184, 166, 0.12)" : isEdited ? "rgba(251, 191, 36, 0.15)" : "rgba(56, 189, 248, 0.06)"}
                stroke={isSelected ? "#14b8a6" : isEdited ? "#f59e0b" : "#38bdf8"}
                strokeWidth={isSelected ? 2 : 1}
                style={{ pointerEvents: "all", cursor: "text" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(node);
                }}
              />
            );
          })}
        </svg>
      )}

      <div className="absolute top-2 right-2 z-20 flex items-center gap-2 pointer-events-auto">
        <span className="text-[10px] font-medium text-slate-600 bg-white/90 px-2 py-1 rounded-full border border-slate-200">
          {nodes.length} labels · {editedCount} edited
        </span>
        <button
          type="button"
          disabled={editedCount === 0 || applying}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-teal-600 text-white disabled:opacity-40 cursor-pointer"
          onClick={() => void handleApply()}
        >
          {applying ? "Applying…" : "Apply ✓"}
        </button>
      </div>

      {selectedId && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 pointer-events-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Edit text</h3>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-[80px] text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") setSelectedId(null);
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") saveEdit();
              }}
            />
            <p className="text-[10px] text-slate-500 mt-2">⌘ ↵ to save · Esc to cancel</p>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 cursor-pointer" onClick={() => setSelectedId(null)}>
                Cancel
              </button>
              <button type="button" className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 text-white cursor-pointer" onClick={saveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
