export interface MindMapNode {
  id: string;
  text: string;
  subtitle?: string;
  x: number;
  y: number;
  color: string;
  textColor?: string;
  children: string[];
  parentId: string | null;
  collapsed?: boolean;
}

export interface MindMapData {
  nodes: Record<string, MindMapNode>;
  rootId: string;
}
