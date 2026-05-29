import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Rect, G } from 'react-native-svg';
import { Colors, NodeConfig } from '../../constants/theme';
import { MindMapNode } from '../../types/mindmap';

interface Props {
  node: MindMapNode;
  x: number;
  y: number;
  isRoot: boolean;
  onToggleCollapse: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export default function MindMapNodeComponent({
  node,
  x,
  y,
  isRoot,
  onToggleCollapse,
  onAddChild,
}: Props) {
  const width = isRoot ? NodeConfig.rootWidth : NodeConfig.nodeWidth;
  const height = isRoot ? NodeConfig.rootHeight : NodeConfig.nodeHeight;
  const bgColor = node.color;
  const textColor = node.textColor || Colors.textDark;

  const hasChildren = node.children.length > 0;

  return (
    <G>
      {/* Node rectangle */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill={bgColor}
        stroke={isRoot ? Colors.primary : Colors.nodeBorder}
        strokeWidth={isRoot ? 0 : 1}
      />

      {/* Expand/collapse indicator for nodes with children */}
      {hasChildren && !isRoot && (
        <Rect
          x={x + width - 20}
          y={y + height / 2 - 8}
          width={16}
          height={16}
          rx={4}
          ry={4}
          fill="#E8E8E8"
        />
      )}
    </G>
  );
}

