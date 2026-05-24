import type { FigurePlan } from "@/components/figures/FigureRenderer";

const PLAN_SESSION_KEY = "anyfigure_pending_plan_session";
const EDIT_FIGURE_ID_KEY = "anyfigure_edit_figure_id";
const HISTORY_KEY = "anyfigure_recent_figures";
const IDB_NAME = "anyfigure_db";
const IDB_STORE = "figure_plans";
const WS_PREFIX = "ws-";

export interface WorkspaceSnapshot {
  elements: import("@/types").CanvasElement[];
  layers: import("@/types").Layer[];
  canvasWidth: number;
  canvasHeight: number;
  projectName: string;
}

export const MAX_RECENT_FIGURES = 15;
export const RETENTION_DAYS = 15;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

/** In-memory handoff so large base64 images are never lost between pages. */
let pendingPlan: FigurePlan | null = null;

export interface StoredFigure {
  id: string;
  prompt: string;
  panels: number;
  mode?: string;
  timestamp: string;
  plan?: FigurePlan;
  /** Editable vector layer (SVG + text nodes) */
  pngUrl?: string;
  svgUrl?: string;
  textNodesUrl?: string;
  editableReady?: boolean;
}

function isWithinRetention(timestamp: string): boolean {
  const t = new Date(timestamp).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= RETENTION_MS;
}

/** Drop figures older than RETENTION_DAYS and keep newest MAX_RECENT_FIGURES. */
export function pruneRecentFigures(figures: StoredFigure[]): StoredFigure[] {
  return figures
    .filter((f) => isWithinRetention(f.timestamp))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, MAX_RECENT_FIGURES);
}

function stripPlanImages(plan: FigurePlan): FigurePlan {
  return {
    ...plan,
    panels: plan.panels?.map((p) => ({ ...p, imageUrl: undefined })),
  };
}

function stripImagesForStorage(figures: StoredFigure[]): StoredFigure[] {
  return figures.map((fig) => ({
    ...fig,
    plan: fig.plan ? stripPlanImages(fig.plan) : fig.plan,
  }));
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("editable_figures")) {
        db.createObjectStore("editable_figures", { keyPath: "figureId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Persist full plan including AI image data URLs (too large for localStorage). */
export async function saveFigurePlanIdb(id: string, plan: FigurePlan): Promise<void> {
  try {
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put({ id, plan, savedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore quota / private mode */
  }
}

export async function loadFigurePlanIdb(id: string): Promise<FigurePlan | null> {
  try {
    const db = await openIdb();
    const result = await new Promise<{ plan: FigurePlan } | undefined>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(id);
      req.onsuccess = () => resolve(req.result as { plan: FigurePlan } | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result?.plan ?? null;
  } catch {
    return null;
  }
}

export async function saveWorkspaceSnapshotIdb(figureId: string, snapshot: WorkspaceSnapshot): Promise<void> {
  try {
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put({ id: `${WS_PREFIX}${figureId}`, snapshot, savedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
}

export async function loadWorkspaceSnapshotIdb(figureId: string): Promise<WorkspaceSnapshot | null> {
  try {
    const db = await openIdb();
    const result = await new Promise<{ snapshot: WorkspaceSnapshot } | undefined>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(`${WS_PREFIX}${figureId}`);
      req.onsuccess = () => resolve(req.result as { snapshot: WorkspaceSnapshot } | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result?.snapshot ?? null;
  } catch {
    return null;
  }
}

export async function deleteWorkspaceSnapshotIdb(figureId: string): Promise<void> {
  try {
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(`${WS_PREFIX}${figureId}`);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
}
export async function deleteFigurePlanIdb(id: string): Promise<void> {
  try {
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
  await deleteWorkspaceSnapshotIdb(id);
  try {
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("editable_figures", "readwrite");
      tx.objectStore("editable_figures").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
}

/** Merge IndexedDB plans (with images) into localStorage metadata rows. */
export async function hydrateStoredFigures(figures: StoredFigure[]): Promise<StoredFigure[]> {
  const hydrated = await Promise.all(
    figures.map(async (fig) => {
      if (fig.plan?.panels?.some((p) => p.imageUrl)) return fig;
      const full = await loadFigurePlanIdb(fig.id);
      if (full) return { ...fig, plan: full };
      return fig;
    })
  );
  return hydrated;
}

function writeRecentFigures(figures: StoredFigure[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(stripImagesForStorage(figures)));
  } catch {
    /* ignore quota */
  }
}

export function savePlanForWorkspace(plan: FigurePlan, figureId?: string) {
  if (typeof window === "undefined") return;
  pendingPlan = plan;
  if (figureId) {
    sessionStorage.setItem(EDIT_FIGURE_ID_KEY, figureId);
    void saveFigurePlanIdb(figureId, plan);
  }
  try {
    sessionStorage.setItem(PLAN_SESSION_KEY, JSON.stringify(stripPlanImages(plan)));
  } catch {
    /* sessionStorage full — pendingPlan + IndexedDB still work */
  }
}

export async function cacheEditPlan(figureId: string, plan: FigurePlan) {
  savePlanForWorkspace(plan, figureId);
  await saveFigurePlanIdb(figureId, plan);
}

export function loadPlanFromStorage(): FigurePlan | null {
  if (pendingPlan) {
    const plan = pendingPlan;
    pendingPlan = null;
    return plan;
  }
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PLAN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FigurePlan;
  } catch {
    return null;
  }
}

export function getEditFigureId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(EDIT_FIGURE_ID_KEY);
}

/** Load full plan for workspace — prefers memory, then IndexedDB, then session lite plan. */
export async function loadPlanForWorkspace(): Promise<FigurePlan | null> {
  if (pendingPlan) {
    const plan = pendingPlan;
    pendingPlan = null;
    return plan;
  }
  const figureId = getEditFigureId();
  if (figureId) {
    const fromIdb = await loadFigurePlanIdb(figureId);
    if (fromIdb) return fromIdb;
  }
  return loadPlanFromStorage();
}

export function clearSessionPlanOnly() {
  pendingPlan = null;
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PLAN_SESSION_KEY);
}

/** Clears in-memory/session handoff but keeps figure id for workspace reload. */
export function clearPlanFromStorage() {
  clearSessionPlanOnly();
}

export function loadRecentFigures(): StoredFigure[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredFigure[];
    const pruned = pruneRecentFigures(parsed);
    if (pruned.length !== parsed.length) {
      writeRecentFigures(pruned);
    }
    return pruned;
  } catch {
    return [];
  }
}

export async function saveRecentFigures(figures: StoredFigure[]) {
  if (typeof window === "undefined") return;
  const pruned = pruneRecentFigures(figures);
  writeRecentFigures(pruned);
  await Promise.all(
    pruned
      .filter((fig) => fig.plan?.panels?.some((p) => p.imageUrl))
      .map((fig) => saveFigurePlanIdb(fig.id, fig.plan!))
  );
}

export function addRecentFigure(fig: StoredFigure) {
  const existing = loadRecentFigures().filter((f) => f.id !== fig.id);
  saveRecentFigures([fig, ...existing]);
}

export function removeRecentFigure(id: string) {
  saveRecentFigures(loadRecentFigures().filter((f) => f.id !== id));
  void deleteFigurePlanIdb(id);
}
