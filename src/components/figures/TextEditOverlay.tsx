"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { TextNode, TextNodesDocument } from "@/types/editableFigure";
import type { TextRegionEntry, TextRegionManifest } from "@/types/detectedText";
import {
  expandDomMaskRect,
  fitLabelFontSize,
  mapPixelBboxToContainerRect,
  sanitizeBbox,
  syncManifestToNaturalSize,
} from "@/lib/makeEditable/imageRegionUtils";

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
  onEditsChange?: (edits: Record<string, string>) => void;
  onRescan?: () => void;
  /** Persist a corrected bbox back into the manifest (drag-to-fix). dx,dy are in
   *  container DOM pixels — caller maps to image pixels using the same scale used
   *  for measurement. */
  onBboxNudge?: (panelId: string, regionId: string, dx: number, dy: number) => void;
  /** Already-applied label edits (persisted on plan manifest). */
  committedEdits?: Record<string, string>;
}

function measureImageManifests(container: HTMLElement, manifests: ImagePanelManifest[]): TextNode[] {
  const nodes: TextNode[] = [];

  for (const { panelId, manifest } of manifests) {
    if (!manifest.regions.length) continue;
    const img =
      (container.querySelector(`[data-figure-image="${panelId}"]`) as HTMLImageElement | null) ||
      (container.querySelector("[data-figure-image]") as HTMLImageElement | null);
    if (!img || img.naturalWidth === 0) continue;

    const synced = syncManifestToNaturalSize(manifest, img.naturalWidth, img.naturalHeight);

    for (const r of synced.regions) {
      const bbox = sanitizeBbox(r.bbox, r.text, synced.imageWidth, synced.imageHeight);
      const layout = mapPixelBboxToContainerRect(bbox, img, container, synced.imageWidth, synced.imageHeight);
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

/** Find which node was hit by a click at (clickX, clickY) relative to overlay. */
function hitTestNodes(nodes: TextNode[], clickX: number, clickY: number): TextNode | null {
  // Check in reverse order so topmost nodes win
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const { x, y, w, h } = node.bbox;
    // Add 4px padding for easier clicking
    if (
      clickX >= x - 4 &&
      clickX <= x + w + 4 &&
      clickY >= y - 4 &&
      clickY <= y + h + 4
    ) {
      return node;
    }
  }
  return null;
}

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
  onEditsChange,
  onRescan,
  onBboxNudge,
  committedEdits = {},
}: TextEditOverlayProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState(false);
  const [domNodes, setDomNodes] = useState<TextNode[]>([]);
  /** Per-node DOM offset (in container pixels) applied during drag — committed
   *  to the manifest via onBboxNudge on mouseup. Lets the user nudge any
   *  misaligned Gemini-detected label onto the correct text. */
  const [dragOffsets, setDragOffsets] = useState<Record<string, { dx: number; dy: number }>>({});
  const dragStateRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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
  const displayEdits = { ...committedEdits, ...edits };
  const canvasWidth = useDom ? domContainer?.clientWidth ?? 1 : (textNodes?.canvasWidth ?? 1200);
  const canvasHeight = useDom ? domContainer?.clientHeight ?? 1 : (textNodes?.canvasHeight ?? 900);
  const editedCount = Object.keys(edits).length;
  const pendingCount = Object.keys(edits).length;

  useEffect(() => {
    onEditsChange?.(edits);
  }, [edits, onEditsChange]);

  const handleSelect = useCallback(
    (node: TextNode) => {
      console.log("[TextEditOverlay] label clicked:", node.id, node.text);
      setSelectedId(node.id);
      setDraft(edits[node.id] ?? node.text);
    },
    [edits]
  );

  /** mouseDown — start a potential drag. We don't know yet whether this is a
   *  click (single-click → edit) or a drag (move label). Decision is made on
   *  mouseUp based on how far the cursor moved. */
  const handleOverlayMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (selectedId) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Account for current drag-offset when hit-testing so the user can grab
      // a label they have already nudged.
      const adjustedNodes = nodes.map((n) => {
        const off = dragOffsets[n.id];
        if (!off) return n;
        return { ...n, bbox: { ...n.bbox, x: n.bbox.x + off.dx, y: n.bbox.y + off.dy } };
      });
      const hit = hitTestNodes(adjustedNodes, x, y);
      if (!hit) return;
      dragStateRef.current = { id: hit.id, startX: x, startY: y, moved: false };
      e.preventDefault();
    },
    [nodes, dragOffsets, selectedId]
  );

  const handleOverlayMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (selectedId) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const drag = dragStateRef.current;

      if (drag) {
        const dx = x - drag.startX;
        const dy = y - drag.startY;
        // Treat as a drag once cursor moves > 3 px
        if (drag.moved || Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          drag.moved = true;
          setDragOffsets((prev) => {
            const existing = prev[drag.id] ?? { dx: 0, dy: 0 };
            return { ...prev, [drag.id]: { dx: existing.dx + dx, dy: existing.dy + dy } };
          });
          // Reset reference so subsequent moves are deltas, not cumulative
          drag.startX = x;
          drag.startY = y;
        }
        return;
      }

      // Pure hover (no drag in progress)
      const adjustedNodes = nodes.map((n) => {
        const off = dragOffsets[n.id];
        if (!off) return n;
        return { ...n, bbox: { ...n.bbox, x: n.bbox.x + off.dx, y: n.bbox.y + off.dy } };
      });
      const hit = hitTestNodes(adjustedNodes, x, y);
      setHoveredId(hit?.id ?? null);
    },
    [nodes, dragOffsets, selectedId]
  );

  const handleOverlayMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      dragStateRef.current = null;
      if (!drag) return;

      const node = nodes.find((n) => n.id === drag.id);
      if (!node) return;

      if (drag.moved) {
        // Was a drag — persist the bbox nudge to the manifest so the new
        // position survives re-renders, edits, and exports.
        const off = dragOffsets[drag.id];
        if (off && onBboxNudge && node.panel_id) {
          onBboxNudge(node.panel_id, node.id, off.dx, off.dy);
          // Local offset can be cleared now — the manifest itself will hold
          // the new bbox once the parent re-measures.
          setDragOffsets((prev) => {
            const next = { ...prev };
            delete next[drag.id];
            return next;
          });
        }
      } else {
        // Was a click — open the edit modal
        handleSelect(node);
      }
      e.stopPropagation();
    },
    [nodes, dragOffsets, handleSelect, onBboxNudge]
  );

  const handleOverlayMouseLeave = useCallback(() => {
    setHoveredId(null);
    // Cancel any in-progress drag if cursor leaves
    if (dragStateRef.current && !dragStateRef.current.moved) {
      dragStateRef.current = null;
    }
  }, []);

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
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto">
        <div className="max-w-sm mx-4 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-800">No editable labels detected yet</p>
          <p className="text-xs text-slate-600 mt-1">Click <strong>Re-scan labels</strong> above or close and reopen Text Edit to detect labels.</p>
          {onRetry && (
            <button type="button" className="mt-3 text-xs font-semibold text-teal-700 cursor-pointer" onClick={onRetry}>
              Detect labels now
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {showDiagramHint && (
        <div className="absolute top-2 left-2 z-[55] pointer-events-none">
          <p className="text-[10px] text-slate-700 bg-white/95 px-2.5 py-1 rounded-full border border-slate-200 shadow-sm max-w-[280px] leading-snug">
            <strong>Click</strong> a label to edit · <strong>Drag</strong> to fix misaligned boxes
          </p>
        </div>
      )}

      {/* ─── SOLID CLICK-CATCHING OVERLAY ─── */}
      {/* This div catches ALL mouse events via pointer-events:auto.
          Hit-testing is done via coordinates, not DOM stacking.
          Click = edit text · Drag = nudge bbox onto correct text */}
      {useDom ? (
        <div
          ref={overlayRef}
          className="absolute inset-0 z-[50] select-none"
          style={{
            pointerEvents: "auto",
            cursor: hoveredId ? (dragStateRef.current ? "grabbing" : "grab") : "crosshair",
            background: "rgba(0, 150, 200, 0.03)",
          }}
          onMouseDown={handleOverlayMouseDown}
          onMouseUp={handleOverlayMouseUp}
          onMouseMove={handleOverlayMouseMove}
          onMouseLeave={handleOverlayMouseLeave}
        >
          {nodes.map((node) => {
            const { x, y, w, h } = node.bbox;
            const isSelected = selectedId === node.id;
            const isHovered = hoveredId === node.id;
            const isPending = node.id in edits;
            const isCommitted = node.id in committedEdits;
            const isEdited = node.id in displayEdits;
            const isDiagram = node.role === "detected";
            const label = displayEdits[node.id] ?? node.text;
            const fontSize = fitLabelFontSize(label, w, h);
            const mask = expandDomMaskRect(node.bbox, isDiagram ? 6 : 3);

            let borderClass: string;
            let bgColor: string;
            if (isSelected) {
              borderClass = "border-2 border-teal-500 ring-2 ring-teal-400/40";
              bgColor = "rgba(20, 184, 166, 0.18)";
            } else if (isHovered) {
              borderClass = isDiagram
                ? "border-2 border-sky-500"
                : "border-2 border-violet-500";
              bgColor = isDiagram ? "rgba(56, 189, 248, 0.25)" : "rgba(167, 139, 250, 0.25)";
            } else if (isPending) {
              borderClass = "border-2 border-amber-500";
              bgColor = "rgba(251, 191, 36, 0.12)";
            } else if (isCommitted) {
              borderClass = "border border-emerald-500/80";
              bgColor = "rgba(16, 185, 129, 0.08)";
            } else if (isDiagram) {
              borderClass = "border-2 border-dashed border-sky-400/70";
              bgColor = "transparent";
            } else {
              borderClass = "border-2 border-dashed border-violet-400/60";
              bgColor = "transparent";
            }

            const off = dragOffsets[node.id];
            const renderX = off ? x + off.dx : x;
            const renderY = off ? y + off.dy : y;
            return (
              <div
                key={node.id}
                className={`absolute rounded pointer-events-none ${borderClass}`}
                style={{
                  left: renderX,
                  top: renderY,
                  width: Math.max(w, 12),
                  height: Math.max(h, 10),
                  background: isEdited ? "#ffffff" : bgColor,
                  transition: off ? "none" : "background 150ms, border-color 150ms",
                }}
              >
                {isEdited && isDiagram && (
                  <div
                    className="absolute"
                    style={{
                      left: mask.x - x,
                      top: mask.y - y,
                      width: mask.w,
                      height: mask.h,
                      background: "#ffffff",
                      boxShadow: "0 0 0 1px #ffffff",
                      zIndex: -1,
                    }}
                  />
                )}
                {isEdited && (
                  <span
                    className="block text-left"
                    style={{
                      fontSize,
                      lineHeight: 1.05,
                      fontWeight: 600,
                      color: "#111827",
                      padding: "1px 4px",
                      whiteSpace: "nowrap",
                      overflow: "visible",
                    }}
                  >
                    {label}
                  </span>
                )}
              </div>
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

      {/* ─── STATS BAR ─── */}
      <div className="absolute top-2 right-2 z-[60] flex items-center gap-2 pointer-events-auto export-exclude">
        {onRescan && (
          <button
            type="button"
            className="text-[10px] font-medium text-slate-600 bg-white/90 px-2 py-1 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50"
            onClick={(e) => { e.stopPropagation(); onRescan(); }}
          >
            Re-scan labels
          </button>
        )}
        <span className="text-[10px] font-medium text-slate-600 bg-white/90 px-2 py-1 rounded-full border border-slate-200 export-exclude">
          {nodes.length} labels · {pendingCount} pending{Object.keys(committedEdits).length ? ` · ${Object.keys(committedEdits).length} applied` : ""}
        </span>
        <button
          type="button"
          disabled={pendingCount === 0 || applying}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-teal-600 text-white disabled:opacity-40 cursor-pointer export-exclude"
          onClick={(e) => { e.stopPropagation(); void handleApply(); }}
        >
          {applying ? "Applying…" : "Apply edits"}
        </button>
      </div>

      {/* ─── EDIT MODAL ─── */}
      {selectedId && (
        <div
          className="absolute inset-0 z-[70] flex items-center justify-center bg-black/30 pointer-events-auto"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md mx-4 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Edit label text</h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Original: <span className="font-mono text-slate-700">{nodes.find((n) => n.id === selectedId)?.text}</span>
            </p>
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
            <p className="text-[10px] text-slate-500 mt-2">Cmd/Ctrl + Enter to save · Esc to cancel</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                onClick={() => setSelectedId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs rounded-lg bg-teal-600 text-white cursor-pointer hover:bg-teal-700"
                onClick={saveEdit}
              >
                Save edit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
