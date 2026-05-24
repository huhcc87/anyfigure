export interface TextNodeBBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextNode {
  id: string;
  text: string;
  bbox: TextNodeBBox;
  panel_id?: string;
  role?: string;
}

export interface TextNodesDocument {
  version: 1;
  figureId: string;
  canvasWidth: number;
  canvasHeight: number;
  nodes: TextNode[];
}

export interface FigureEditableAssets {
  svg: string;
  svgUrl: string;
  textNodes: TextNodesDocument;
  textNodesJson: string;
  textNodesUrl: string;
  width: number;
  height: number;
  elementCount: number;
}
