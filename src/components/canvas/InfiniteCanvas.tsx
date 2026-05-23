"use client";

import { useRef, useCallback, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { generateId } from "@/lib/utils";

const GRID_SIZE = 20;

export default function InfiniteCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { elements, zoom, panX, panY, setPan, setZoom, tool, addElement, setSelectedIds, selectedIds, showGrid } = useEditorStore();
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = -e.deltaY * 0.002;
      setZoom(zoom + delta);
    } else {
      setPan(panX - e.deltaX, panY - e.deltaY);
    }
  }, [zoom, panX, panY, setZoom, setPan]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool === "pan" || (e.button === 1)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, panX, panY });
      return;
    }
    if (tool === "select") {
      setSelectedIds([]);
    }
    if (tool === "shape") {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - panX) / zoom;
      const y = (e.clientY - rect.top - panY) / zoom;
      addElement({
        type: "shape",
        x,
        y,
        width: 120,
        height: 80,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        fill: "#6366f120",
        stroke: "#6366f1",
        strokeWidth: 2,
      });
    }
    if (tool === "text") {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - panX) / zoom;
      const y = (e.clientY - rect.top - panY) / zoom;
      addElement({
        type: "text",
        x,
        y,
        width: 160,
        height: 36,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        content: "Double-click to edit",
        fill: "transparent",
        stroke: "transparent",
        strokeWidth: 0,
      });
    }
  }, [tool, panX, panY, zoom, addElement, setSelectedIds, elements.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan(panStart.panX + (e.clientX - panStart.x), panStart.panY + (e.clientY - panStart.y));
    }
    if (dragging) {
      const dx = (e.clientX - dragging.startX) / zoom;
      const dy = (e.clientY - dragging.startY) / zoom;
      useEditorStore.getState().updateElement(dragging.id, {
        x: dragging.elX + dx,
        y: dragging.elY + dy,
      });
    }
  }, [isPanning, panStart, setPan, dragging, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragging(null);
  }, []);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tool !== "select") return;
    setSelectedIds([id]);
    const el = elements.find((el) => el.id === id);
    if (!el) return;
    setDragging({ id, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y });
  }, [tool, elements, setSelectedIds]);

  const gridStyle = showGrid ? {
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
    backgroundPosition: `${panX % (GRID_SIZE * zoom)}px ${panY % (GRID_SIZE * zoom)}px`,
  } : {};

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex).filter((el) => el.visible);

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative overflow-hidden bg-[#080C1C] select-none"
      style={{
        cursor: tool === "pan" || isPanning ? "grab" : tool === "shape" ? "crosshair" : tool === "text" ? "text" : "default",
        ...gridStyle,
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Canvas transform layer */}
      <div
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* Paper shadow */}
        <div
          className="absolute bg-white/[0.03] border border-white/10 rounded-sm shadow-2xl"
          style={{ width: 1200, height: 900 }}
        />

        {/* Elements */}
        {sortedElements.map((el) => {
          const isSelected = selectedIds.includes(el.id);
          return (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                transform: `rotate(${el.rotation}deg)`,
                opacity: el.opacity,
                zIndex: el.zIndex,
                cursor: tool === "select" ? (el.locked ? "not-allowed" : "move") : "default",
              }}
              onMouseDown={(e) => handleElementMouseDown(e, el.id)}
            >
              {/* Shape */}
              {el.type === "shape" && (
                <div
                  className="w-full h-full rounded-sm"
                  style={{
                    backgroundColor: el.fill || "transparent",
                    border: `${el.strokeWidth || 2}px solid ${el.stroke || "#6366f1"}`,
                    outline: isSelected ? "2px solid #6366f1" : "none",
                    outlineOffset: 2,
                  }}
                />
              )}

              {/* Text */}
              {el.type === "text" && (
                <div
                  className="w-full h-full flex items-center px-1"
                  style={{
                    outline: isSelected ? "2px solid #6366f1" : "1px dashed rgba(99,102,241,0.3)",
                    outlineOffset: 2,
                    color: "white",
                    fontSize: 14,
                  }}
                >
                  {el.content || el.label || "Text"}
                </div>
              )}

              {/* Biomedical / other */}
              {(el.type === "biomedical" || el.type === "pathway" || el.type === "chart") && (
                <div
                  className="w-full h-full rounded-md flex items-center justify-center text-xs text-zinc-500"
                  style={{
                    backgroundColor: el.fill || "rgba(99,102,241,0.05)",
                    border: `${el.strokeWidth || 2}px solid ${el.stroke || "#6366f130"}`,
                    outline: isSelected ? "2px solid #6366f1" : "none",
                    outlineOffset: 2,
                  }}
                >
                  {el.label || el.type}
                </div>
              )}

              {/* Selection handles */}
              {isSelected && (
                <>
                  {[
                    { top: -4, left: -4 },
                    { top: -4, right: -4 },
                    { bottom: -4, left: -4 },
                    { bottom: -4, right: -4 },
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-white border-2 border-indigo-500 rounded-sm"
                      style={{ ...pos, cursor: "nwse-resize" }}
                    />
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-zinc-600">
                <rect x="3" y="3" width="22" height="22" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 14h10M14 9v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm text-zinc-600 font-medium">Click a tool, then click to add elements</p>
            <p className="text-xs text-zinc-700 mt-1">Or use AI Generate to create a figure automatically</p>
          </div>
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-[#0F1629]/80 backdrop-blur-sm border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 font-mono">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
