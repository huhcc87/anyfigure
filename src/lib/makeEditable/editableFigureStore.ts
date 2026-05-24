import type { TextNodesDocument } from "@/types/editableFigure";

const IDB_NAME = "anyfigure_db";
const EDITABLE_STORE = "editable_figures";

export interface EditableFigureRecord {
  figureId: string;
  svg: string;
  svgDataUrl: string;
  textNodes: TextNodesDocument;
  textNodesJson: string;
  textNodesUrl: string;
  pngUrl?: string;
  width: number;
  height: number;
  elementCount: number;
  convertedAt: number;
  editorUrl: string;
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("figure_plans")) {
        db.createObjectStore("figure_plans", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(EDITABLE_STORE)) {
        db.createObjectStore(EDITABLE_STORE, { keyPath: "figureId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getEditableFigure(figureId: string): Promise<EditableFigureRecord | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openIdb();
    const result = await new Promise<EditableFigureRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(EDITABLE_STORE, "readonly");
      const req = tx.objectStore(EDITABLE_STORE).get(figureId);
      req.onsuccess = () => resolve(req.result as EditableFigureRecord | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result ?? null;
  } catch {
    return null;
  }
}

export async function saveEditableFigure(record: EditableFigureRecord): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(EDITABLE_STORE, "readwrite");
      tx.objectStore(EDITABLE_STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
}

export async function hasEditableConversion(figureId: string): Promise<boolean> {
  const rec = await getEditableFigure(figureId);
  return !!rec?.svg && !!rec?.textNodes?.nodes?.length;
}

export function editableRecordFromAssets(
  figureId: string,
  assets: {
    svg: string;
    svgUrl: string;
    textNodes: TextNodesDocument;
    textNodesJson: string;
    textNodesUrl: string;
    width: number;
    height: number;
    elementCount: number;
  },
  pngUrl?: string
): EditableFigureRecord {
  return {
    figureId,
    svg: assets.svg,
    svgDataUrl: assets.svgUrl,
    textNodes: assets.textNodes,
    textNodesJson: assets.textNodesJson,
    textNodesUrl: assets.textNodesUrl,
    pngUrl,
    width: assets.width,
    height: assets.height,
    elementCount: assets.elementCount,
    convertedAt: Date.now(),
    editorUrl: `/workspace?figure=${encodeURIComponent(figureId)}&editable=1`,
  };
}
