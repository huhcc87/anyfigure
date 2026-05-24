/** Pixel bbox in original image coordinates: [x, y, width, height]. */
export type PixelBbox = [number, number, number, number];

/** One detected text region (FigureLabs-style manifest entry). */
export interface TextRegionEntry {
  id: string;
  bbox: PixelBbox;
  text: string;
  confidence: number;
  panelId?: string;
}

/** Cached text-region manifest for one panel image. */
export interface TextRegionManifest {
  imageWidth: number;
  imageHeight: number;
  regions: TextRegionEntry[];
  model?: string;
  extractedAt?: number;
}

/** Combined figure-level text_nodes.json export. */
export interface FigureTextNodesManifest {
  imageWidth: number;
  imageHeight: number;
  regions: TextRegionEntry[];
}

/** @deprecated Legacy normalized 0–1 coords — migrate via getPanelTextManifest(). */
export interface DetectedTextRegion {
  id: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ExtractTextRegionsResult {
  manifest: TextRegionManifest;
  model: string;
}
