import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  CanvasElement,
  Layer,
  EditorTool,
  HistoryEntry,
} from "@/types";
import type { FigurePlan } from "@/components/figures/FigureRenderer";
import type { WorkspaceSnapshot } from "@/lib/figureStore";
import { importFigurePlan } from "@/lib/planToEditor";
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
  loadFromFigurePlan: (plan: FigurePlan) => void;
  loadWorkspaceSnapshot: (snapshot: WorkspaceSnapshot) => void;
  getWorkspaceSnapshot: () => WorkspaceSnapshot;
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
      if (!layer) return;
      layer.visible = !layer.visible;
      for (const elId of layer.elements) {
        const el = state.elements.find((e) => e.id === elId);
        if (el) el.visible = layer.visible;
      }
    }),

    toggleLayerLock: (id) => set((state) => {
      const layer = state.layers.find((l) => l.id === id);
      if (!layer) return;
      layer.locked = !layer.locked;
      for (const elId of layer.elements) {
        const el = state.elements.find((e) => e.id === elId);
        if (el) el.locked = layer.locked;
      }
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

    loadFromFigurePlan: (plan) => {
      const { elements, canvasWidth, canvasHeight } = importFigurePlan(plan);
      set((state) => {
        state.elements = elements;
        state.canvasWidth = canvasWidth;
        state.canvasHeight = canvasHeight;
        state.projectName = plan.title?.slice(0, 60) || "Untitled Figure";
        state.selectedIds = [];
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;

        const hasTemplateParts = elements.some((e) => e.partRole === "part");

        const groups: { name: string; ids: string[]; locked?: boolean; visible?: boolean }[] = [
          { name: "Title", ids: elements.filter((e) => e.textRole === "title").map((e) => e.id), visible: true },
          {
            name: "Figure",
            ids: elements.filter((e) => e.type === "image").map((e) => e.id),
            visible: true,
            locked: false,
          },
          ...(hasTemplateParts
            ? [
                { name: "Diagram Parts", ids: elements.filter((e) => e.partRole === "part").map((e) => e.id), visible: true },
                { name: "Arrows", ids: elements.filter((e) => e.type === "arrow").map((e) => e.id), visible: true },
              ]
            : []),
          {
            name: "Diagram Labels",
            ids: elements.filter((e) => e.partRole === "detected").map((e) => e.id),
            visible: true,
          },
          { name: "Labels", ids: elements.filter((e) => e.textRole === "label").map((e) => e.id), visible: true },
          { name: "Caption", ids: elements.filter((e) => e.textRole === "caption").map((e) => e.id), visible: true },
          { name: "Legend", ids: elements.filter((e) => e.textRole === "legend").map((e) => e.id), visible: true },
        ].filter((g) => g.ids.length > 0);

        for (const g of groups) {
          const layerVisible = g.visible ?? true;
          for (const elId of g.ids) {
            const el = elements.find((e) => e.id === elId);
            if (el) el.visible = layerVisible;
          }
        }

        state.layers = groups.map((g) => ({
          id: generateId("layer"),
          name: g.name,
          visible: g.visible ?? true,
          locked: g.locked ?? false,
          elements: g.ids,
        }));
        state.activeLayerId = state.layers[0]?.id ?? null;
        state.history = [{ elements: JSON.parse(JSON.stringify(elements)), timestamp: Date.now() }];
        state.historyIndex = 0;
      });
    },

    loadWorkspaceSnapshot: (snapshot) => {
      set((state) => {
        state.elements = JSON.parse(JSON.stringify(snapshot.elements));
        state.layers = JSON.parse(JSON.stringify(snapshot.layers));
        state.canvasWidth = snapshot.canvasWidth;
        state.canvasHeight = snapshot.canvasHeight;
        state.projectName = snapshot.projectName;
        state.selectedIds = [];
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        state.history = [{ elements: JSON.parse(JSON.stringify(snapshot.elements)), timestamp: Date.now() }];
        state.historyIndex = 0;
      });
    },

    getWorkspaceSnapshot: () => {
      const state = get();
      return {
        elements: JSON.parse(JSON.stringify(state.elements)),
        layers: JSON.parse(JSON.stringify(state.layers)),
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        projectName: state.projectName,
      };
    },
  }))
);
