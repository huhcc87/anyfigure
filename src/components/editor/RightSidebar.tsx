"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

type RightTab = "layers" | "properties" | "ai-suggestions";

export type { RightTab };

interface RightSidebarProps {
  activeTab?: RightTab;
  onTabChange?: (tab: RightTab) => void;
  onExport?: (format: "png" | "svg" | "pdf" | "pptx") => void;
}

export default function RightSidebar({ activeTab: controlledTab, onTabChange, onExport }: RightSidebarProps = {}) {
  const [internalTab, setInternalTab] = useState<RightTab>("layers");
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: RightTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const { layers, elements, selectedIds, toggleLayerVisibility, toggleLayerLock, addLayer, removeLayer, updateElement, removeElements } = useEditorStore();

  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
  const firstSelected = selectedElements[0];

  const tabs: { id: RightTab; label: string }[] = [
    { id: "layers", label: "Layers" },
    { id: "properties", label: "Properties" },
    { id: "ai-suggestions", label: "AI" },
  ];

  return (
    <aside className="w-64 h-full bg-[#0F1629] border-l border-white/10 flex flex-col flex-shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "text-white border-b-2 border-indigo-500"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Layers Panel */}
        {activeTab === "layers" && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Layers</span>
              <button
                onClick={() => addLayer(`Layer ${layers.length + 1}`)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="space-y-1">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 group"
                >
                  <button
                    onClick={() => toggleLayerVisibility(layer.id)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    {layer.visible ? (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 2.5C3.5 2.5 1 6.5 1 6.5s2.5 4 5.5 4 5.5-4 5.5-4-2.5-4-5.5-4z" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 2l9 9M5 4.5C3 5.5 1.5 6.5 1.5 6.5s2.5 4 5 4c.8 0 1.6-.2 2.3-.6M8 4c1.5.8 3 2.5 3 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => toggleLayerLock(layer.id)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    {layer.locked ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <rect x="2" y="5.5" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <rect x="2" y="5.5" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M4 5.5V4a2 2 0 014 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                  <span className="flex-1 text-xs text-zinc-300 truncate">{layer.name}</span>
                  <span className="text-xs text-zinc-600">{layer.elements.length}</span>
                  {layers.length > 1 && (
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M2 2l7 7M9 2L2 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties Panel */}
        {activeTab === "properties" && (
          <div className="p-3">
            {firstSelected ? (
              <div className="space-y-4">
                {firstSelected.type === "biomedical" && (
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-2">Asset label</label>
                    <textarea
                      value={firstSelected.label || firstSelected.content || ""}
                      onChange={(e) => updateElement(firstSelected.id, {
                        label: e.target.value,
                        content: e.target.value,
                      })}
                      rows={2}
                      className="w-full bg-white/5 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-indigo-500 resize-y leading-relaxed"
                    />
                  </div>
                )}
                {firstSelected.type === "biomedical" && (
                  <>
                    <div>
                      <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-2">Scientific name</label>
                      <input
                        type="text"
                        value={firstSelected.scientificName || ""}
                        onChange={(e) => updateElement(firstSelected.id, { scientificName: e.target.value })}
                        className="w-full bg-white/5 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-2">Description</label>
                      <textarea
                        value={firstSelected.assetDescription || ""}
                        onChange={(e) => updateElement(firstSelected.id, { assetDescription: e.target.value })}
                        rows={3}
                        className="w-full bg-white/5 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-indigo-500 resize-y"
                      />
                    </div>
                  </>
                )}
                {firstSelected.type === "text" && (
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-2">
                      {firstSelected.textRole === "legend" ? "Legend" : firstSelected.textRole === "caption" ? "Caption" : firstSelected.textRole === "title" ? "Title" : "Text"}
                    </label>
                    <textarea
                      value={firstSelected.content || firstSelected.label || ""}
                      onChange={(e) => updateElement(firstSelected.id, { content: e.target.value })}
                      rows={firstSelected.textRole === "legend" ? 6 : 3}
                      className="w-full bg-white/5 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-indigo-500 resize-y leading-relaxed"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-2">Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-zinc-600 block mb-1">X</span>
                      <input
                        type="number"
                        value={Math.round(firstSelected.x)}
                        onChange={(e) => updateElement(firstSelected.id, { x: Number(e.target.value) })}
                        className="w-full bg-white/5 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-600 block mb-1">Y</span>
                      <input
                        type="number"
                        value={Math.round(firstSelected.y)}
                        onChange={(e) => updateElement(firstSelected.id, { y: Number(e.target.value) })}
                        className="w-full bg-white/5 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-2">Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-zinc-600 block mb-1">W</span>
                      <input
                        type="number"
                        value={Math.round(firstSelected.width)}
                        onChange={(e) => updateElement(firstSelected.id, { width: Math.max(20, Number(e.target.value)) })}
                        className="w-full bg-white/5 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-600 block mb-1">H</span>
                      <input
                        type="number"
                        value={Math.round(firstSelected.height)}
                        onChange={(e) => updateElement(firstSelected.id, { height: Math.max(20, Number(e.target.value)) })}
                        className="w-full bg-white/5 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-2">Fill</label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded border border-white/10 flex-shrink-0"
                      style={{ backgroundColor: firstSelected.fill || "#6366f1" }}
                    />
                    <input
                      type="text"
                      value={firstSelected.fill || "#6366f1"}
                      onChange={(e) => updateElement(firstSelected.id, { fill: e.target.value })}
                      className="flex-1 bg-white/5 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-2">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={firstSelected.opacity}
                    onChange={(e) => updateElement(firstSelected.id, { opacity: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <span className="text-xs text-zinc-500 mt-1">{Math.round(firstSelected.opacity * 100)}%</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeElements(selectedIds)}
                  className="w-full py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                >
                  Delete selected (Del)
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-zinc-600">
                    <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                  </svg>
                </div>
                <p className="text-xs text-zinc-600">Select an element to edit its properties</p>
              </div>
            )}
          </div>
        )}

        {/* AI Suggestions */}
        {activeTab === "ai-suggestions" && (
          <div className="p-3 space-y-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">AI Suggestions</p>
            {[
              "Add a statistical significance bar chart",
              "Insert a cell signaling pathway arrow",
              "Use Nature-style color palette",
              "Add figure legend below panel",
              "Align elements to grid",
            ].map((suggestion, i) => (
              <button
                key={i}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 border border-white/5 hover:border-indigo-500/30 transition-all"
              >
                <span className="text-indigo-400 mr-1.5">✦</span>
                {suggestion}
              </button>
            ))}
            <div className="pt-2">
              <textarea
                placeholder="Ask AI for suggestions..."
                className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg p-2.5 outline-none focus:border-indigo-500 resize-none placeholder:text-zinc-600"
                rows={3}
              />
              <button className="mt-2 w-full py-2 text-xs font-semibold rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/20 transition-colors">
                Ask AI
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Settings */}
      <div className="border-t border-white/10 p-3">
        <p className="text-xs text-zinc-600 uppercase tracking-wide font-semibold mb-2">Export</p>
        <div className="grid grid-cols-2 gap-1.5">
          {(["PNG", "SVG", "PDF", "PPTX"] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => onExport?.(fmt.toLowerCase() as "png" | "svg" | "pdf" | "pptx")}
              className="py-1.5 text-xs font-medium rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
