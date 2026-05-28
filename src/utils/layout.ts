import { MindMapNode, MindMapData } from '../types/mindmap';
import { NodeConfig } from '../constants/theme';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeHeight: number;
  branchIndex: number;
}

function getNodeSize(data: MindMapData, nodeId: string): { width: number; height: number } {
  const node = data.nodes[nodeId];
  const isRoot = nodeId === data.rootId;
  if (isRoot) return { width: NodeConfig.rootWidth, height: NodeConfig.rootHeight };
  if (node.parentId === data.rootId) return { width: NodeConfig.nodeWidth, height: NodeConfig.nodeHeight };
  return { width: NodeConfig.subNodeWidth, height: NodeConfig.subNodeHeight };
}

function getSubtreeHeight(data: MindMapData, nodeId: string): number {
  const node = data.nodes[nodeId];
  const { height } = getNodeSize(data, nodeId);
  if (!node || node.collapsed || node.children.length === 0) {
    return height + NodeConfig.verticalGap;
  }
  let total = 0;
  for (const childId of node.children) {
    total += getSubtreeHeight(data, childId);
  }
  return Math.max(total, height + NodeConfig.verticalGap);
}

// Organic offset: các nhánh con lệch nhẹ lên/xuôn để tạo cảm giác tự nhiên
function getOrganicOffset(branchIndex: number, totalBranches: number): number {
  if (totalBranches <= 1) return 0;
  const offsets = [-6, 4, -3, 5, -4, 3];
  return offsets[branchIndex % offsets.length];
}

function layoutSubtree(
  data: MindMapData,
  nodeId: string,
  x: number,
  yCenter: number,
  branchIndex: number,
  results: Record<string, LayoutNode>,
): void {
  const node = data.nodes[nodeId];
  const { width, height } = getNodeSize(data, nodeId);
  const subtreeH = getSubtreeHeight(data, nodeId);

  results[nodeId] = {
    id: nodeId,
    x,
    y: yCenter - height / 2,
    width,
    height,
    subtreeHeight: subtreeH,
    branchIndex,
  };

  if (node.collapsed || node.children.length === 0) return;

  const childX = x + width + NodeConfig.horizontalGap;
  let currentY = yCenter - subtreeH / 2;

  for (let i = 0; i < node.children.length; i++) {
    const childId = node.children[i];
    const childSubH = getSubtreeHeight(data, childId);
    const childCenter = currentY + childSubH / 2 + getOrganicOffset(i, node.children.length);
    layoutSubtree(data, childId, childX, childCenter, branchIndex, results);
    currentY += childSubH;
  }
}

export function calculateLayout(data: MindMapData): Record<string, LayoutNode> {
  const results: Record<string, LayoutNode> = {};
  const root = data.nodes[data.rootId];
  const allH = getSubtreeHeight(data, data.rootId);

  // Root ở bên trái, giữa chiều cao
  layoutSubtree(data, data.rootId, 24, allH / 2, -1, results);

  // Gán branchIndex cho từng nhánh con của root
  if (root && !root.collapsed) {
    root.children.forEach((childId, idx) => {
      const childLayout = results[childId];
      if (childLayout) {
        assignBranch(data, childId, idx, results);
      }
    });
  }

  return results;
}

function assignBranch(data: MindMapData, nodeId: string, branchIdx: number, results: Record<string, LayoutNode>) {
  const node = data.nodes[nodeId];
  if (results[nodeId]) results[nodeId].branchIndex = branchIdx;
  if (node && !node.collapsed) {
    node.children.forEach((childId) => assignBranch(data, childId, branchIdx, results));
  }
}

let idCounter = 100;
export function generateId(): string {
  return `node_${idCounter++}`;
}

export function createInitialData(): MindMapData {
  const rootId = 'root';
  const boicanh = 'boicanh', bc1 = 'bc_1', bc2 = 'bc_2', bc3 = 'bc_3';
  const duongloi = 'duongloi', dl1 = 'dl_1', dl2 = 'dl_2', dl3 = 'dl_3', dl4 = 'dl_4';
  const dienbien = 'dienbien', db1 = 'db_1', db2 = 'db_2', db3 = 'db_3', db4 = 'db_4';
  const ketqua = 'ketqua', kq1 = 'kq_1', kq2 = 'kq_2', kq3 = 'kq_3';
  const ynghia = 'ynghia', yn1 = 'yn_1', yn2 = 'yn_2', yn3 = 'yn_3';

  const nodes: Record<string, MindMapNode> = {
    [rootId]: {
      id: rootId, text: 'Kháng chiến chống Pháp\n(1946 - 1954)',
      x: 0, y: 0, color: '#7C5CFC', textColor: '#FFFFFF',
      children: [boicanh, duongloi, dienbien, ketqua, ynghia], parentId: null, collapsed: false,
    },
    [boicanh]: {
      id: boicanh, text: 'Bối cảnh lịch sử',
      x: 0, y: 0, color: '#F0EDFF',
      children: [bc1, bc2, bc3], parentId: rootId, collapsed: false,
    },
    [bc1]: { id: bc1, text: 'Pháp quay lại xâm lược VN', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: boicanh, collapsed: false },
    [bc2]: { id: bc2, text: 'Hiệp định Sơ bộ 6/3/1946', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: boicanh, collapsed: false },
    [bc3]: { id: bc3, text: 'Tạm ước 14/9/1946', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: boicanh, collapsed: false },
    [duongloi]: {
      id: duongloi, text: 'Đường lối kháng chiến',
      x: 0, y: 0, color: '#EDF7FF',
      children: [dl1, dl2, dl3, dl4], parentId: rootId, collapsed: false,
    },
    [dl1]: { id: dl1, text: 'Toàn dân', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: duongloi, collapsed: false },
    [dl2]: { id: dl2, text: 'Toàn diện', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: duongloi, collapsed: false },
    [dl3]: { id: dl3, text: 'Trường kỳ', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: duongloi, collapsed: false },
    [dl4]: { id: dl4, text: 'Tự lực cánh sinh', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: duongloi, collapsed: false },
    [dienbien]: {
      id: dienbien, text: 'Diễn biến chính',
      x: 0, y: 0, color: '#FFF5EC',
      children: [db1, db2, db3, db4], parentId: rootId, collapsed: false,
    },
    [db1]: { id: db1, text: 'Toàn quốc kháng chiến 12/1946', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: dienbien, collapsed: false },
    [db2]: { id: db2, text: 'Việt Bắc Thu - Đông 1947', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: dienbien, collapsed: false },
    [db3]: { id: db3, text: 'Biên Giới Thu - Đông 1950', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: dienbien, collapsed: false },
    [db4]: { id: db4, text: 'Điện Biên Phủ 1954', x: 0, y: 0, color: '#FFF0F5', children: [], parentId: dienbien, collapsed: false },
    [ketqua]: {
      id: ketqua, text: 'Kết quả',
      x: 0, y: 0, color: '#EDFFF4',
      children: [kq1, kq2, kq3], parentId: rootId, collapsed: false,
    },
    [kq1]: { id: kq1, text: 'Chiến thắng ĐBP lịch sử', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: ketqua, collapsed: false },
    [kq2]: { id: kq2, text: 'Hiệp định Genève 7/1954', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: ketqua, collapsed: false },
    [kq3]: { id: kq3, text: 'Giải phóng miền Bắc', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: ketqua, collapsed: false },
    [ynghia]: {
      id: ynghia, text: 'Ý nghĩa lịch sử',
      x: 0, y: 0, color: '#FFF8E1',
      children: [yn1, yn2, yn3], parentId: rootId, collapsed: false,
    },
    [yn1]: { id: yn1, text: 'Củng cố chính quyền', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: ynghia, collapsed: false },
    [yn2]: { id: yn2, text: 'Tiền đề thống nhất', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: ynghia, collapsed: false },
    [yn3]: { id: yn3, text: 'Cổ vũ GPDT thế giới', x: 0, y: 0, color: '#FFFFFF', children: [], parentId: ynghia, collapsed: false },
  };

  return { nodes, rootId };
}
