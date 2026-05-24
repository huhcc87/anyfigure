import Fuse from "fuse.js";
import type { BiomedicalAsset, BiomedicalAssetCategory } from "@/types/biomedicalAssets";
import { BIOMEDICAL_ASSETS, getAssetById } from "@/data/biomedicalAssets";

const FAVORITES_KEY = "anyfigure_bio_favorites";
const RECENT_KEY = "anyfigure_bio_recent";
const MAX_RECENT = 12;

const fuse = new Fuse(BIOMEDICAL_ASSETS, {
  keys: ["name", "scientificName", "tags", "description", "category", "subcategory"],
  threshold: 0.35,
  includeScore: true,
});

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function searchBiomedicalAssets(query: string): BiomedicalAsset[] {
  const q = query.trim();
  if (!q) return BIOMEDICAL_ASSETS;
  return fuse.search(q).map((r) => r.item);
}

export function filterBiomedicalAssets(
  query: string,
  category: BiomedicalAssetCategory | "all"
): BiomedicalAsset[] {
  const searched = searchBiomedicalAssets(query);
  if (category === "all") return searched;
  return searched.filter((a) => a.category === category);
}

export function getFavoriteIds(): string[] {
  return readJson<string[]>(FAVORITES_KEY, []);
}

export function getFavoriteAssets(): BiomedicalAsset[] {
  return getFavoriteIds()
    .map((id) => getAssetById(id))
    .filter(Boolean) as BiomedicalAsset[];
}

export function toggleFavorite(assetId: string): boolean {
  const ids = getFavoriteIds();
  const exists = ids.includes(assetId);
  const next = exists ? ids.filter((id) => id !== assetId) : [assetId, ...ids];
  writeJson(FAVORITES_KEY, next);
  return !exists;
}

export function isFavorite(assetId: string): boolean {
  return getFavoriteIds().includes(assetId);
}

export function getRecentIds(): string[] {
  return readJson<string[]>(RECENT_KEY, []);
}

export function getRecentAssets(): BiomedicalAsset[] {
  return getRecentIds()
    .map((id) => getAssetById(id))
    .filter(Boolean) as BiomedicalAsset[];
}

export function recordRecentUse(assetId: string) {
  const ids = getRecentIds().filter((id) => id !== assetId);
  writeJson(RECENT_KEY, [assetId, ...ids].slice(0, MAX_RECENT));
}

export function getAssetCount(): number {
  return BIOMEDICAL_ASSETS.length;
}

export function getCategoryCounts(): Record<BiomedicalAssetCategory | "all", number> {
  const counts = { all: BIOMEDICAL_ASSETS.length } as Record<BiomedicalAssetCategory | "all", number>;
  for (const asset of BIOMEDICAL_ASSETS) {
    counts[asset.category] = (counts[asset.category] ?? 0) + 1;
  }
  return counts;
}
