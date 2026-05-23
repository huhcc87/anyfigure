import type { FigurePlan } from "@/components/figures/FigureRenderer";

const KEY = "anyfigure_pending_plan";

export function savePlanForWorkspace(plan: FigurePlan) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(plan));
}

export function loadPlanFromStorage(): FigurePlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FigurePlan;
  } catch {
    return null;
  }
}

export function clearPlanFromStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
