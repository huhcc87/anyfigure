"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { loadPlanForWorkspace, clearPlanFromStorage, getEditFigureId, loadWorkspaceSnapshotIdb, saveWorkspaceSnapshotIdb, loadFigurePlanIdb, cacheEditPlan } from "@/lib/figureStore";
import { getPanelTextManifest } from "@/lib/makeEditable/imageRegionUtils";
import type { CanvasElement } from "@/types";

const GRID_SIZE = 20;

function needsEditableUpgrade(elements: CanvasElement[]): boolean {
  const hasLegacyOverlay = elements.some((e) => e.partRole === "reference")
    && elements.some((e) => e.partRole === "part");
  const hasHiddenAiOnly = elements.some((e) => e.partRole === "reference" && !e.visible)
    && !elements.some((e) => e.partRole === "figure");
  return hasLegacyOverlay || hasHiddenAiOnly;
}

function canvasPoint(
  e: React.MouseEvent,
  canvasEl: HTMLDivElement | null,
  panX: number,
  panY: number,
  zoom: number
): { x: number; y: number } | null {
  if (!canvasEl) return null;
  const rect = canvasEl.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left - panX) / zoom,
    y: (e.clientY - rect.top - panY) / zoom,
  };
}

function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

function boundsFromPoints(points: { x: number; y: number }[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { minX, minY, width: Math.max(8, maxX - minX), height: Math.max(8, maxY - minY) };
}

function textStyles(el: CanvasElement): React.CSSProperties {
  const role = el.textRole;
  // CHECK detected FIRST so OCR-detected labels get proportional font size,
  // not the fixed 13px label size that causes wrapping in small bboxes.
  if (el.partRole === "detected") {
    const size = Math.max(7, Math.min(16, Math.round(el.height * 0.72)));
    return {
      fontSize: size,
      fontWeight: 600,
      color: "#111827",
      lineHeight: 1.05,
      whiteSpace: "nowrap",       // prevent wrap that turned "Module 1" → "Mod / ule 1"
      overflow: "visible",        // let text overflow the bbox cleanly
      textOverflow: "clip",
    };
  }
  if (role === "title") {
    return { fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.3 };
  }
  if (role === "legend") {
    return { fontSize: 11, fontWeight: 400, fontStyle: "italic", color: "#374151", lineHeight: 1.5 };
  }
  if (role === "caption") {
    return { fontSize: 11, fontWeight: 400, color: "#4B5563", lineHeight: 1.45 };
  }
  if (role === "label") {
    return { fontSize: 13, fontWeight: 700, color: el.fill || "#6366f1", lineHeight: 1.2 };
  }
  return { fontSize: 12, fontWeight: 400, color: "#111827", lineHeight: 1.4 };
}

export default function InfiniteCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    elements, layers, zoom, panX, panY, setPan, setZoom, tool, setTool, addElement,
    setSelectedIds, selectedIds, showGrid, updateElement, canvasWidth, canvasHeight,
    loadFromFigurePlan, projectName, pushHistory, loadWorkspaceSnapshot, getWorkspaceSnapshot,
    removeElements,
  } = useEditorStore();

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; corner: number; startX: number; startY: number; elX: number; elY: number; elW: number; elH: number } | null>(null);
  const [arrowDraft, setArrowDraft] = useState<{ from: { x: number; y: number }; to: { x: number; y: number } } | null>(null);
  const [penPoints, setPenPoints] = useState<{ x: number; y: number }[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [activeFigureId, setActiveFigureId] = useState<string | null>(null);
  const centeredRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const figureId = getEditFigureId();
      if (figureId) {
        const saved = await loadWorkspaceSnapshotIdb(figureId);
        if (cancelled) return;
        if (saved?.elements?.length) {
          const plan = await loadFigurePlanIdb(figureId);
          const needsUpgrade =
            needsEditableUpgrade(saved.elements) ||
            (!!plan?.panels?.some((p) => (getPanelTextManifest(p)?.regions.length ?? 0) > 0) &&
              !saved.elements.some((e) => e.partRole === "detected"));
          if (needsUpgrade && plan?.panels?.length) {
            loadFromFigurePlan(plan);
            setActiveFigureId(figureId);
            clearPlanFromStorage();
            setPlanLoaded(true);
            centeredRef.current = false;
            return;
          }
          loadWorkspaceSnapshot(saved);
          setActiveFigureId(figureId);
          clearPlanFromStorage();
          setPlanLoaded(true);
          centeredRef.current = false;
          return;
        }
      }

      const stored = await loadPlanForWorkspace();
      if (cancelled || !stored?.panels?.length) return;
      loadFromFigurePlan(stored);
      if (figureId) setActiveFigureId(figureId);
      clearPlanFromStorage();
      setPlanLoaded(true);
      centeredRef.current = false;
    })();
    return () => {
      cancelled = true;
    };
  }, [loadFromFigurePlan, loadWorkspaceSnapshot]);

  useEffect(() => {
    if (!activeFigureId || elements.length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveWorkspaceSnapshotIdb(activeFigureId, getWorkspaceSnapshot());
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [elements, layers, canvasWidth, canvasHeight, projectName, activeFigureId, getWorkspaceSnapshot]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (editingId) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      const key = e.key.toLowerCase();
      const toolKeys: Record<string, typeof tool> = {
        v: "select", h: "pan", r: "shape", t: "text", a: "arrow", p: "pen",
      };
      if (toolKeys[key] && !e.metaKey && !e.ctrlKey) {
        setTool(toolKeys[key]);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        e.preventDefault();
        removeElements(selectedIds);
      }
      if (e.key === "Escape") {
        setArrowDraft(null);
        setPenPoints(null);
        setEditingId(null);
        setSelectedIds([]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingId, selectedIds, setTool, removeElements, setSelectedIds]);

  const centerCanvas = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    const padding = 48;
    const availW = el.clientWidth - padding * 2;
    const availH = el.clientHeight - padding * 2;
    const fitZoom = Math.min(availW / canvasWidth, availH / canvasHeight, 1);
    const scaledW = canvasWidth * fitZoom;
    const scaledH = canvasHeight * fitZoom;
    setZoom(fitZoom);
    setPan((el.clientWidth - scaledW) / 2, (el.clientHeight - scaledH) / 2);
  }, [canvasWidth, canvasHeight, setZoom, setPan]);

  useEffect(() => {
    if (centeredRef.current) return;
    centerCanvas();
    centeredRef.current = true;
  }, [centerCanvas, planLoaded]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      setZoom(zoom + (-e.deltaY * 0.002));
    } else {
      setPan(panX - e.deltaX, panY - e.deltaY);
    }
  }, [zoom, panX, panY, setZoom, setPan]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (editingId) return;
    if (tool === "pan" || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, panX, panY });
      return;
    }

    const pt = canvasPoint(e, canvasRef.current, panX, panY, zoom);
    if (!pt) return;

    if (tool === "select") {
      setSelectedIds([]);
      setEditingId(null);
      return;
    }
    if (tool === "shape") {
      addElement({
        type: "shape",
        shapeKind: "rect",
        x: pt.x, y: pt.y, width: 120, height: 80,
        rotation: 0, opacity: 1, locked: false, visible: true,
        fill: "#6366f120", stroke: "#6366f1", strokeWidth: 2,
        partRole: "part",
      });
      return;
    }
    if (tool === "text") {
      addElement({
        type: "text",
        x: pt.x, y: pt.y, width: 280, height: 36,
        rotation: 0, opacity: 1, locked: false, visible: true,
        content: "Double-click to edit",
        fill: "transparent", stroke: "transparent", strokeWidth: 0,
      });
      return;
    }
    if (tool === "arrow") {
      setArrowDraft({ from: pt, to: pt });
      return;
    }
    if (tool === "pen") {
      setPenPoints([pt]);
    }
  }, [tool, panX, panY, zoom, addElement, setSelectedIds, editingId]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (editingId) return;
    if (isPanning) {
      setPan(panStart.panX + (e.clientX - panStart.x), panStart.panY + (e.clientY - panStart.y));
    }
    if (dragging) {
      const el = elements.find((item) => item.id === dragging.id);
      if (el?.locked) return;
      const dx = (e.clientX - dragging.startX) / zoom;
      const dy = (e.clientY - dragging.startY) / zoom;
      updateElement(dragging.id, { x: dragging.elX + dx, y: dragging.elY + dy });
    }
    if (resizing) {
      const dx = (e.clientX - resizing.startX) / zoom;
      const dy = (e.clientY - resizing.startY) / zoom;
      const { corner, elX, elY, elW, elH, id } = resizing;
      let x = elX, y = elY, width = elW, height = elH;
      if (corner === 0) { x = elX + dx; y = elY + dy; width = elW - dx; height = elH - dy; }
      else if (corner === 1) { y = elY + dy; width = elW + dx; height = elH - dy; }
      else if (corner === 2) { x = elX + dx; width = elW - dx; height = elH + dy; }
      else { width = elW + dx; height = elH + dy; }
      if (width >= 20 && height >= 20) {
        updateElement(id, { x, y, width, height });
      }
    }
    const pt = canvasPoint(e, canvasRef.current, panX, panY, zoom);
    if (pt && arrowDraft) {
      setArrowDraft({ from: arrowDraft.from, to: pt });
    }
    if (pt && penPoints) {
      setPenPoints((prev) => (prev ? [...prev, pt] : [pt]));
    }
  }, [isPanning, panStart, setPan, dragging, resizing, zoom, updateElement, elements, editingId, arrowDraft, penPoints, panX, panY]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (dragging) pushHistory();
    setDragging(null);
    if (resizing) pushHistory();
    setResizing(null);

    if (arrowDraft) {
      const { from, to } = arrowDraft;
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      if (dist > 8) {
        const pad = 12;
        const x1 = from.x, y1 = from.y, x2 = to.x, y2 = to.y;
        addElement({
          type: "arrow",
          x: Math.min(x1, x2) - pad,
          y: Math.min(y1, y2) - pad,
          width: Math.max(Math.abs(x2 - x1) + pad * 2, 24),
          height: Math.max(Math.abs(y2 - y1) + pad * 2, 24),
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          stroke: "#6366f1",
          strokeWidth: 2.5,
          lineFrom: { x: x1, y: y1 },
          lineTo: { x: x2, y: y2 },
          arrowKind: "activate",
          partRole: "part",
        });
      }
      setArrowDraft(null);
    }

    if (penPoints && penPoints.length > 1) {
      const { minX, minY, width, height } = boundsFromPoints(penPoints);
      const rel = penPoints.map((p) => ({ x: p.x - minX, y: p.y - minY }));
      addElement({
        type: "shape",
        x: minX,
        y: minY,
        width,
        height,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        fill: "transparent",
        stroke: "#6366f1",
        strokeWidth: 2,
        pathData: pointsToPath(rel),
        partRole: "part",
      });
    }
    setPenPoints(null);
  }, [dragging, resizing, pushHistory, arrowDraft, penPoints, addElement]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, id: string, corner: number) => {
    e.stopPropagation();
    const el = elements.find((item) => item.id === id);
    if (!el || el.locked) return;
    setSelectedIds([id]);
    setResizing({
      id, corner, startX: e.clientX, startY: e.clientY,
      elX: el.x, elY: el.y, elW: el.width, elH: el.height,
    });
  }, [elements, setSelectedIds]);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tool !== "select" || editingId) return;
    const el = elements.find((item) => item.id === id);
    if (!el || el.locked) return;
    setSelectedIds([id]);
    setDragging({ id, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y });
  }, [tool, elements, setSelectedIds, editingId]);

  const handleElementDoubleClick = useCallback((e: React.MouseEvent, id: string, el: CanvasElement) => {
    e.stopPropagation();
    if (el.type !== "text" || el.locked) return;
    setEditingId(id);
    setSelectedIds([id]);
    setDragging(null);
  }, [setSelectedIds]);

  const finishEditing = useCallback((id: string, content: string) => {
    pushHistory();
    updateElement(id, { content });
    setEditingId(null);

    const el = elements.find((item) => item.id === id);
    if (el?.partRole === "detected" && activeFigureId) {
      void (async () => {
        const plan = await loadFigurePlanIdb(activeFigureId);
        if (!plan?.panels?.length) return;
        const panels = plan.panels.map((p) => {
          if (!p.textNodesManifest?.regions.some((r) => r.id === id)) return p;
          return {
            ...p,
            textNodesManifest: {
              ...p.textNodesManifest,
              regions: p.textNodesManifest.regions.map((r) => (r.id === id ? { ...r, text: content } : r)),
            },
          };
        });
        await cacheEditPlan(activeFigureId, { ...plan, panels });
      })();
    }
  }, [updateElement, pushHistory, elements, activeFigureId]);

  const gridStyle = showGrid ? {
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
    backgroundPosition: `${panX % (GRID_SIZE * zoom)}px ${panY % (GRID_SIZE * zoom)}px`,
  } : {};

  const isElementVisible = useCallback((el: CanvasElement) => {
    if (!el.visible) return false;
    const layer = layers.find((l) => l.elements.includes(el.id));
    return !layer || layer.visible;
  }, [layers]);

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex).filter(isElementVisible);

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative overflow-hidden bg-[#e8eaed] select-none"
      style={{
        cursor: tool === "pan" || isPanning ? "grab" : tool === "shape" || tool === "arrow" ? "crosshair" : tool === "pen" ? "crosshair" : tool === "text" ? "text" : "default",
        ...gridStyle,
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* All figure content lives INSIDE export target so PNG/PDF/PPT capture correctly */}
        <div
          id="figure-export-target"
          className="relative bg-white border border-gray-200 rounded-sm shadow-xl overflow-hidden"
          style={{ width: canvasWidth, height: canvasHeight }}
        >
        {sortedElements.map((el) => {
          const isSelected = selectedIds.includes(el.id);
          const isEditing = editingId === el.id;

          // OCR-detected labels: use the FULL pre-expanded width from
          // planToEditor (which is sized to be ~3× the Gemini bbox so the
          // white background fully covers the baked-in raster text).
          const isDetected = el.type === "text" && el.partRole === "detected";
          return (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: el.x,
                top: el.y,
                width: el.width,
                height: isDetected ? el.height : el.type === "text" ? "auto" : el.height,
                minHeight: el.type === "text" ? el.height : undefined,
                transform: `rotate(${el.rotation}deg)`,
                opacity: el.opacity,
                zIndex: el.zIndex + 1,
                cursor: tool === "select"
                  ? isEditing ? "text" : el.locked ? "default" : el.type === "text" ? "text" : "move"
                  : "default",
                pointerEvents: el.locked ? "none" : "auto",
              }}
              onMouseDown={(e) => handleElementMouseDown(e, el.id)}
              onDoubleClick={(e) => handleElementDoubleClick(e, el.id, el)}
            >
              {el.type === "shape" && el.pathData && (
                <svg
                  className="w-full h-full overflow-visible"
                  style={{
                    outline: isSelected ? "2px solid #6366f1" : "none",
                    outlineOffset: 2,
                  }}
                >
                  <path
                    d={el.pathData}
                    fill="none"
                    stroke={el.stroke || "#6366f1"}
                    strokeWidth={el.strokeWidth || 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {el.type === "shape" && !el.pathData && (
                <div
                  className={`w-full h-full flex items-center justify-center p-1 ${el.shapeKind === "marker" && el.label ? "relative" : ""}`}
                  style={{
                    borderRadius: el.shapeKind === "ellipse" || el.shapeKind === "marker"
                      ? "50%"
                      : el.shapeKind === "nucleosome"
                        ? 999
                        : 4,
                    backgroundColor: el.shapeKind === "marker" ? (el.fill || el.stroke || "#10B981") : (el.fill || "transparent"),
                    border: el.shapeKind === "marker"
                      ? `${el.strokeWidth || 2}px ${el.opacity < 1 ? "dashed" : "solid"} ${el.stroke || el.fill || "#10B981"}`
                      : `${el.strokeWidth || 2}px solid ${el.stroke || "#6366f1"}`,
                    outline: isSelected ? "2px solid #6366f1" : el.partRole === "part" ? "1px dashed rgba(99,102,241,0.2)" : "none",
                    outlineOffset: 2,
                  }}
                >
                  {el.shapeKind !== "marker" && el.shapeKind !== "nucleosome" && (
                    <span className="text-[10px] text-gray-600 text-center leading-snug pointer-events-none">{el.label || el.content}</span>
                  )}
                  {el.shapeKind === "marker" && el.label && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-semibold whitespace-nowrap pointer-events-none" style={{ color: el.stroke || el.fill }}>{el.label}</span>
                  )}
                </div>
              )}

              {el.type === "text" && (
                <div
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  className={isDetected ? "outline-none rounded flex items-center justify-center" : "w-full outline-none px-0.5 py-0 rounded"}
                  style={{
                    ...textStyles(el),
                    color: isDetected ? "#111827" : (textStyles(el).color as string),
                    width: isDetected ? "100%" : undefined,
                    height: isDetected ? "100%" : undefined,
                    outline: isDetected
                      ? isSelected || isEditing
                        ? "2px solid #6366f1"
                        : "1px dashed rgba(99,102,241,0.25)"
                      : isSelected
                        ? "2px solid #6366f1"
                        : "1px dashed rgba(99,102,241,0.3)",
                    outlineOffset: isDetected ? 0 : 2,
                    minHeight: el.height,
                    whiteSpace: isDetected ? "nowrap" : "pre-wrap",
                    wordBreak: isDetected ? "normal" : "break-word",
                    textAlign: isDetected ? "center" : undefined,
                    background: isDetected
                      ? "#ffffff"
                      : isEditing
                        ? "rgba(99,102,241,0.06)"
                        : isSelected
                          ? "rgba(99,102,241,0.04)"
                          : "transparent",
                    // Detected labels get a 3-layer white halo so the original
                    // baked-in raster text in the AI image underneath is
                    // fully obliterated even when Gemini's bbox is offset.
                    boxShadow: isDetected
                      ? "0 0 0 2px #ffffff, 0 0 0 4px #ffffff, 0 0 8px 6px rgba(255,255,255,0.95)"
                      : undefined,
                  }}
                  onBlur={(e) => {
                    if (isEditing) finishEditing(el.id, e.currentTarget.textContent || "");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.currentTarget.blur();
                      setEditingId(null);
                    }
                  }}
                >
                  {el.content || el.label || "Text"}
                </div>
              )}

              {el.type === "image" && el.content && (
                <div
                  className="w-full h-full flex items-center justify-center rounded overflow-hidden bg-white"
                  style={{
                    outline: isSelected ? "2px solid #6366f1" : "none",
                    outlineOffset: isSelected ? 2 : 0,
                    pointerEvents: el.locked ? "none" : "auto",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={el.content}
                    alt={el.label || "Figure panel"}
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              )}

              {el.type === "arrow" && el.lineFrom && el.lineTo && (
                <svg
                  className="absolute inset-0 overflow-visible pointer-events-none"
                  style={{
                    left: 0,
                    top: 0,
                    width: el.width,
                    height: el.height,
                    outline: isSelected ? "2px solid #6366f1" : "none",
                    outlineOffset: 2,
                  }}
                >
                  {el.arrowKind !== "inhibit" && (
                    <defs>
                      <marker
                        id={`arrowhead-${el.id}`}
                        markerWidth="8"
                        markerHeight="8"
                        refX="7"
                        refY="4"
                        orient="auto"
                      >
                        <path d="M0,0 L8,4 L0,8 Z" fill={el.stroke || "#6366f1"} />
                      </marker>
                    </defs>
                  )}
                  <line
                    x1={el.lineFrom.x - el.x}
                    y1={el.lineFrom.y - el.y}
                    x2={el.lineTo.x - el.x}
                    y2={el.lineTo.y - el.y}
                    stroke={el.stroke || "#6366f1"}
                    strokeWidth="2.5"
                    strokeDasharray={el.arrowKind === "inhibit" ? "5 3" : undefined}
                    markerEnd={el.arrowKind !== "inhibit" ? `url(#arrowhead-${el.id})` : undefined}
                  />
                  {el.arrowKind === "inhibit" && (
                    <line
                      x1={el.lineTo.x - el.x - 6}
                      y1={el.lineTo.y - el.y - 6}
                      x2={el.lineTo.x - el.x + 6}
                      y2={el.lineTo.y - el.y + 6}
                      stroke={el.stroke || "#EF4444"}
                      strokeWidth="3"
                    />
                  )}
                  {el.label && (
                    <text
                      x={(el.lineFrom.x + el.lineTo.x) / 2 - el.x}
                      y={Math.min(el.lineFrom.y, el.lineTo.y) - el.y - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fill={el.stroke || "#6366f1"}
                      fontWeight="600"
                    >
                      {el.label}
                    </text>
                  )}
                </svg>
              )}

              {el.type === "arrow" && !el.lineFrom && (
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox={`0 0 ${Math.max(el.width, 1)} ${Math.max(el.height, 1)}`}
                  style={{
                    outline: isSelected ? "2px solid #6366f1" : "none",
                    outlineOffset: 2,
                  }}
                >
                  <defs>
                    <marker
                      id={`arrowhead-${el.id}`}
                      markerWidth="8"
                      markerHeight="8"
                      refX="7"
                      refY="4"
                      orient="auto"
                    >
                      <path d="M0,0 L8,4 L0,8 Z" fill={el.stroke || "#6366f1"} />
                    </marker>
                  </defs>
                  <line
                    x1="0"
                    y1={el.height / 2}
                    x2={el.width}
                    y2={el.height / 2}
                    stroke={el.stroke || "#6366f1"}
                    strokeWidth="2"
                    markerEnd={`url(#arrowhead-${el.id})`}
                  />
                  {el.label && (
                    <text
                      x={el.width / 2}
                      y={Math.max(10, el.height / 2 - 6)}
                      textAnchor="middle"
                      fontSize="9"
                      fill={el.stroke || "#6366f1"}
                      fontWeight="600"
                    >
                      {el.label}
                    </text>
                  )}
                </svg>
              )}

              {(el.type === "biomedical" || el.type === "pathway" || el.type === "chart") && (
                <div
                  className="w-full h-full rounded-md flex flex-col items-center justify-center text-xs text-gray-500 p-1"
                  style={{
                    backgroundColor: el.fill || "rgba(99,102,241,0.05)",
                    border: `${el.strokeWidth || 2}px solid ${el.stroke || "#6366f130"}`,
                    outline: isSelected ? "2px solid #6366f1" : "none",
                    outlineOffset: 2,
                  }}
                >
                  {el.assetEmoji && <span className="text-3xl leading-none mb-1">{el.assetEmoji}</span>}
                  <span className="text-[10px] text-gray-600 text-center leading-snug font-medium">{el.label || el.type}</span>
                  {el.scientificName && (
                    <span className="text-[8px] text-gray-400 italic mt-0.5">{el.scientificName}</span>
                  )}
                </div>
              )}

              {isSelected && !el.locked && !isEditing && (
                <div className="export-exclude">
                  {[
                    { top: -4, left: -4, corner: 0 },
                    { top: -4, right: -4, corner: 1 },
                    { bottom: -4, left: -4, corner: 2 },
                    { bottom: -4, right: -4, corner: 3 },
                  ].map((pos) => (
                    <div
                      key={pos.corner}
                      className="absolute w-2 h-2 bg-white border-2 border-indigo-500 rounded-sm"
                      style={{ top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom, cursor: "nwse-resize" }}
                      onMouseDown={(e) => handleResizeMouseDown(e, el.id, pos.corner)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        </div>

        {/* Live drawing previews (excluded from export) */}
        {arrowDraft && (
          <svg
            className="export-exclude absolute overflow-visible pointer-events-none"
            style={{ left: 0, top: 0, width: canvasWidth, height: canvasHeight }}
          >
            <defs>
              <marker id="arrow-draft-head" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#6366f1" />
              </marker>
            </defs>
            <line
              x1={arrowDraft.from.x}
              y1={arrowDraft.from.y}
              x2={arrowDraft.to.x}
              y2={arrowDraft.to.y}
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              markerEnd="url(#arrow-draft-head)"
            />
          </svg>
        )}
        {penPoints && penPoints.length > 1 && (
          <svg
            className="export-exclude absolute overflow-visible pointer-events-none"
            style={{ left: 0, top: 0, width: canvasWidth, height: canvasHeight }}
          >
            <path
              d={pointsToPath(penPoints)}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {elements.length === 0 && !planLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white shadow flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-gray-400">
                <rect x="3" y="3" width="22" height="22" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 14h10M14 9v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm text-gray-700 font-medium">Empty canvas — generate a figure or add elements</p>
            <p className="text-xs text-gray-500 mt-1">
              Use the prompt bar above (Vector AI), or drag in biomedical assets from the left panel.
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-500 font-mono shadow-sm">
        {Math.round(zoom * 100)}%
      </div>

      {elements.length > 0 && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5 text-xs text-indigo-700 shadow-sm max-w-[85%]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
          <span className="truncate">
            Select tool (V) · click markers, arrows, nucleosomes · toggle AI reference in Layers · double-click legend
          </span>
        </div>
      )}
    </div>
  );
}
