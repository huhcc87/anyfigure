import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  CanvasElement,
  Layer,
  EditorTool,
  HistoryEntry,
} from "@/types";
import { generateId } from "@/lib/utils";

interface EditorStore {
  // Canvas state
  elements: CanvasElement[];
  layers: Layer[];
  selectedIds: string[];
  zoom: number;
  panX: number;
  panY: number;
  tool: EditorTool;
  canvasWidth: number;
  canvasHeight: number;

  // UI state
  showGrid: boolean;
  showRulers: boolean;
  showAssetLibrary: boolean;
  showAIPanel: boolean;
  activeLayerId: string | null;
  projectName: string;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Actions
  setTool: (tool: EditorTool) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setSelectedIds: (ids: string[]) => void;
  addElement: (element: Omit<CanvasElement, "id" | "zIndex">) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;
  moveToFront: (id: string) => void;
  moveToBack: (id: string) => void;
  addLayer: (name: string) => void;
  removeLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  setProjectName: (name: string) => void;
  toggleGrid: () => void;
  toggleAssetLibrary: () => void;
  toggleAIPanel: () => void;
  reset: () => void;
}

const defaultLayer: Layer = {
  id: "layer-default",
  name: "Layer 1",
  visible: true,
  locked: false,
  elements: [],
};

const initialState = {
  elements: [] as CanvasElement[],
  layers: [defaultLayer],
  selectedIds: [] as string[],
  zoom: 1,
  panX: 0,
  panY: 0,
  tool: "select" as EditorTool,
  canvasWidth: 1200,
  canvasHeight: 900,
  showGrid: true,
  showRulers: false,
  showAssetLibrary: false,
  showAIPanel: false,
  activeLayerId: "layer-default",
  projectName: "Untitled Figure",
  history: [] as HistoryEntry[],
  historyIndex: -1,
};

export const useEditorStore = create<EditorStore>()(
  immer((set, get) => ({
    ...initialState,

    setTool: (tool) => set((state) => { state.tool = tool; }),

    setZoom: (zoom) => set((state) => {
      state.zoom = Math.min(Math.max(zoom, 0.1), 5);
    }),

    setPan: (x, y) => set((state) => {
      state.panX = x;
      state.panY = y;
    }),

    setSelectedIds: (ids) => set((state) => { state.selectedIds = ids; }),

    addElement: (elementData) => {
      get().pushHistory();
      set((state) => {
        const element: CanvasElement = {
          ...elementData,
          id: generateId(),
          zIndex: state.elements.length,
        } as CanvasElement;
        state.elements.push(element);
        if (state.activeLayerId) {
          const layer = state.layers.find((l) => l.id === state.activeLayerId);
          if (layer) layer.elements.push(element.id);
        }
      });
    },

    updateElement: (id, updates) => set((state) => {
      const idx = state.elements.findIndex((el) => el.id === id);
      if (idx !== -1) {
        Object.assign(state.elements[idx], updates);
      }
    }),

    removeElements: (ids) => {
      get().pushHistory();
      set((state) => {
        state.elements = state.elements.filter((el) => !ids.includes(el.id));
        state.layers.forEach((layer) => {
          layer.elements = layer.elements.filter((id) => !ids.includes(id));
        });
        state.selectedIds = state.selectedIds.filter((id) => !ids.includes(id));
      });
    },

    duplicateElements: (ids) => {
      get().pushHistory();
      set((state) => {
        const toDuplicate = state.elements.filter((el) => ids.includes(el.id));
        const newElements = toDuplicate.map((el) => ({
          ...el,
          id: generateId(),
          x: el.x + 20,
          y: el.y + 20,
          zIndex: state.elements.length,
        }));
        state.elements.push(...newElements);
      });
    },

    moveToFront: (id) => set((state) => {
      const maxZ = Math.max(...state.elements.map((el) => el.zIndex));
      const el = state.elements.find((e) => e.id === id);
      if (el) el.zIndex = maxZ + 1;
    }),

    moveToBack: (id) => set((state) => {
      const minZ = Math.min(...state.elements.map((el) => el.zIndex));
      const el = state.elements.find((e) => e.id === id);
      if (el) el.zIndex = minZ - 1;
    }),

    addLayer: (name) => set((state) => {
      const newLayer: Layer = {
        id: generateId("layer"),
        name,
        visible: true,
        locked: false,
        elements: [],
      };
      state.layers.push(newLayer);
      state.activeLayerId = newLayer.id;
    }),

    removeLayer: (id) => set((state) => {
      if (state.layers.length <= 1) return;
      state.layers = state.layers.filter((l) => l.id !== id);
      if (state.activeLayerId === id) {
        state.activeLayerId = state.layers[0]?.id ?? null;
      }
    }),

    toggleLayerVisibility: (id) => set((state) => {
      const layer = state.layers.find((l) => l.id === id);
      if (layer) layer.visible = !layer.visible;
    }),

    toggleLayerLock: (id) => set((state) => {
      const layer = state.layers.find((l) => l.id === id);
      if (layer) layer.locked = !layer.locked;
    }),

    pushHistory: () => set((state) => {
      const entry: HistoryEntry = {
        elements: JSON.parse(JSON.stringify(state.elements)),
        timestamp: Date.now(),
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(entry);
      if (newHistory.length > 50) newHistory.shift();
      state.history = newHistory;
      state.historyIndex = newHistory.length - 1;
    }),

    undo: () => set((state) => {
      if (state.historyIndex <= 0) return;
      state.historyIndex -= 1;
      state.elements = JSON.parse(JSON.stringify(state.history[state.historyIndex].elements));
    }),

    redo: () => set((state) => {
      if (state.historyIndex >= state.history.length - 1) return;
      state.historyIndex += 1;
      state.elements = JSON.parse(JSON.stringify(state.history[state.historyIndex].elements));
    }),

    setProjectName: (name) => set((state) => { state.projectName = name; }),

    toggleGrid: () => set((state) => { state.showGrid = !state.showGrid; }),

    toggleAssetLibrary: () => set((state) => {
      state.showAssetLibrary = !state.showAssetLibrary;
    }),

    toggleAIPanel: () => set((state) => {
      state.showAIPanel = !state.showAIPanel;
    }),

    reset: () => set(() => ({ ...initialState })),
  }))
);
