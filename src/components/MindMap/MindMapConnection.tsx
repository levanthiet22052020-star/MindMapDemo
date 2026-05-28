import React from 'react';
import { G, Line } from 'react-native-svg';
import { NodeConfig } from '../../constants/theme';

interface Props {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export default function MindMapConnection({ fromX, fromY, toX, toY }: Props) {
  const startX = fromX + NodeConfig.nodeWidth;
  const startY = fromY + NodeConfig.nodeHeight / 2;
  const endX = toX;
  const endY = toY + NodeConfig.nodeHeight / 2;

  const midX = (startX + endX) / 2;

  return (
    <G>
      <Line
        x1={startX}
        y1={startY}
        x2={midX}
        y2={startY}
        stroke="#B0B0B0"
        strokeWidth={2}
      />
      <Line
        x1={midX}
        y1={startY}
        x2={midX}
        y2={endY}
        stroke="#B0B0B0"
        strokeWidth={2}
      />
      <Line
        x1={midX}
        y1={endY}
        x2={endX}
        y2={endY}
        stroke="#B0B0B0"
        strokeWidth={2}
      />
    </G>
  );
}
