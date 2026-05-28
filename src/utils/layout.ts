import { MindMapNode, MindMapData } from '../types/mindmap';
import { NodeConfig } from '../constants/theme';

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeHeight: number;
}

function getNodeSize(data: MindMapData, nodeId: string): { width: number; height: number } {
  const node = data.nodes[nodeId];
  const isRoot = nodeId === data.rootId;
  if (isRoot) return { width: NodeConfig.rootWidth, height: NodeConfig.rootHeight };

  if (node.parentId === data.rootId) {
    return { width: NodeConfig.nodeWidth, height: NodeConfig.nodeHeight };
  }
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

function layoutSubtree(
  data: MindMapData,
  nodeId: string,
  x: number,
  yCenter: number,
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
  };

  if (node.collapsed || node.children.length === 0) return;

  const childX = x + width + NodeConfig.horizontalGap;
  let currentY = yCenter - subtreeH / 2;

  for (const childId of node.children) {
    const childSubH = getSubtreeHeight(data, childId);
    const childCenter = currentY + childSubH / 2;
    layoutSubtree(data, childId, childX, childCenter, results);
    currentY += childSubH;
  }
}

export function calculateLayout(data: MindMapData): Record<string, LayoutNode> {
  const results: Record<string, LayoutNode> = {};
  const allH = getSubtreeHeight(data, data.rootId);
  const { height: rootH } = getNodeSize(data, data.rootId);
  layoutSubtree(data, data.rootId, 20, allH / 2, results);
  return results;
}

let idCounter = 100;
export function generateId(): string {
  return `node_${idCounter++}`;
}

export function createInitialData(): MindMapData {
  const rootId = 'root';

  // Branch 1: Bối cảnh
  const boicanh = 'boicanh';
  const bc1 = 'bc_1';
  const bc2 = 'bc_2';
  const bc3 = 'bc_3';

  // Branch 2: Đường lối
  const duongloi = 'duongloi';
  const dl1 = 'dl_1';
  const dl2 = 'dl_2';
  const dl3 = 'dl_3';
  const dl4 = 'dl_4';

  // Branch 3: Diễn biến
  const dienbien = 'dienbien';
  const db1 = 'db_1';
  const db2 = 'db_2';
  const db3 = 'db_3';
  const db4 = 'db_4';

  // Branch 4: Kết quả
  const ketqua = 'ketqua';
  const kq1 = 'kq_1';
  const kq2 = 'kq_2';
  const kq3 = 'kq_3';

  // Branch 5: Ý nghĩa
  const ynghia = 'ynghia';
  const yn1 = 'yn_1';
  const yn2 = 'yn_2';
  const yn3 = 'yn_3';

  const nodes: Record<string, MindMapNode> = {
    // === ROOT ===
    [rootId]: {
      id: rootId,
      text: 'Kháng chiến chống Pháp\n(1946 - 1954)',
      x: 0, y: 0,
      color: '#4A7BF7',
      textColor: '#FFFFFF',
      children: [boicanh, duongloi, dienbien, ketqua, ynghia],
      parentId: null,
      collapsed: false,
    },

    // === BRANCH 1: Bối cảnh ===
    [boicanh]: {
      id: boicanh,
      text: 'Bối cảnh lịch sử',
      x: 0, y: 0,
      color: '#FFF7ED',
      children: [bc1, bc2, bc3],
      parentId: rootId,
      collapsed: false,
    },
    [bc1]: {
      id: bc1,
      text: 'Pháp quay lại xâm lược VN sau CTTG2',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: boicanh,
      collapsed: false,
    },
    [bc2]: {
      id: bc2,
      text: 'Hiệp định Sơ bộ 6/3/1946',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: boicanh,
      collapsed: false,
    },
    [bc3]: {
      id: bc3,
      text: 'Tạm ước 14/9/1946 - ta tranh thủ hòa hoãn',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: boicanh,
      collapsed: false,
    },

    // === BRANCH 2: Đường lối ===
    [duongloi]: {
      id: duongloi,
      text: 'Đường lối kháng chiến',
      x: 0, y: 0,
      color: '#F0FDF4',
      children: [dl1, dl2, dl3, dl4],
      parentId: rootId,
      collapsed: false,
    },
    [dl1]: {
      id: dl1,
      text: 'Toàn dân',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: duongloi,
      collapsed: false,
    },
    [dl2]: {
      id: dl2,
      text: 'Toàn diện (chính trị, quân sự, kinh tế...)',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: duongloi,
      collapsed: false,
    },
    [dl3]: {
      id: dl3,
      text: 'Trường kỳ (dài lâu)',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: duongloi,
      collapsed: false,
    },
    [dl4]: {
      id: dl4,
      text: 'Tự lực cánh sinh',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: duongloi,
      collapsed: false,
    },

    // === BRANCH 3: Diễn biến ===
    [dienbien]: {
      id: dienbien,
      text: 'Diễn biến chính',
      x: 0, y: 0,
      color: '#FDF2F8',
      children: [db1, db2, db3, db4],
      parentId: rootId,
      collapsed: false,
    },
    [db1]: {
      id: db1,
      text: 'Toàn quốc kháng chiến 19/12/1946',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: dienbien,
      collapsed: false,
    },
    [db2]: {
      id: db2,
      text: 'Chiến dịch Việt Bắc Thu - Đông 1947',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: dienbien,
      collapsed: false,
    },
    [db3]: {
      id: db3,
      text: 'Chiến dịch Biên Giới Thu - Đông 1950',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: dienbien,
      collapsed: false,
    },
    [db4]: {
      id: db4,
      text: 'Chiến dịch Điện Biên Phủ 1954',
      x: 0, y: 0,
      color: '#FFF1F2',
      children: [],
      parentId: dienbien,
      collapsed: false,
    },

    // === BRANCH 4: Kết quả ===
    [ketqua]: {
      id: ketqua,
      text: 'Kết quả',
      x: 0, y: 0,
      color: '#FEF9C3',
      children: [kq1, kq2, kq3],
      parentId: rootId,
      collapsed: false,
    },
    [kq1]: {
      id: kq1,
      text: 'Chiến thắng Điện Biên Phủ lịch sử',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: ketqua,
      collapsed: false,
    },
    [kq2]: {
      id: kq2,
      text: 'Hiệp định Genève 7/1954',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: ketqua,
      collapsed: false,
    },
    [kq3]: {
      id: kq3,
      text: 'Giải phóng hoàn toàn miền Bắc',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: ketqua,
      collapsed: false,
    },

    // === BRANCH 5: Ý nghĩa ===
    [ynghia]: {
      id: ynghia,
      text: 'Ý nghĩa lịch sử',
      x: 0, y: 0,
      color: '#F5F3FF',
      children: [yn1, yn2, yn3],
      parentId: rootId,
      collapsed: false,
    },
    [yn1]: {
      id: yn1,
      text: 'Củng cố chính quyền dân chủ nhân dân',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: ynghia,
      collapsed: false,
    },
    [yn2]: {
      id: yn2,
      text: 'Tạo tiền đề thống nhất đất nước',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: ynghia,
      collapsed: false,
    },
    [yn3]: {
      id: yn3,
      text: 'Cổ vũ phong trào GPDT thế giới',
      x: 0, y: 0,
      color: '#FFFFFF',
      children: [],
      parentId: ynghia,
      collapsed: false,
    },
  };

  return { nodes, rootId };
}
