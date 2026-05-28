import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Svg, G, Path, Rect, Circle, Defs, Filter, FeDropShadow,
  ForeignObject, LinearGradient, Stop,
} from 'react-native-svg';
import { MindMapData, MindMapNode } from '../../types/mindmap';
import { Colors, NodeConfig, BranchColors } from '../../constants/theme';
import { calculateLayout, generateId, LayoutNode } from '../../utils/layout';

interface Props {
  data: MindMapData;
  onDataChange: (data: MindMapData) => void;
  onFitReady?: (fitFn: () => void) => void;
}

interface NormalizedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  branchIndex: number;
}

const SAFE_PAD = 48;
const EXTRA_RIGHT = NodeConfig.addButtonSize + 10;

function isVisible(data: MindMapData, node: MindMapNode): boolean {
  let current = node.parentId;
  while (current) {
    if (data.nodes[current]?.collapsed) return false;
    current = data.nodes[current]?.parentId;
  }
  return true;
}

// Chuẩn hóa: dịch toàn bộ layout về vùng dương, bắt đầu từ (SAFE_PAD, SAFE_PAD)
function normalizeLayout(rawLayout: Record<string, LayoutNode>): {
  nodes: Record<string, NormalizedNode>;
  contentWidth: number;
  contentHeight: number;
} {
  const all = Object.values(rawLayout);
  if (all.length === 0) {
    return { nodes: {}, contentWidth: 200, contentHeight: 200 };
  }

  const rawMinX = Math.min(...all.map((n) => n.x));
  const rawMinY = Math.min(...all.map((n) => n.y));
  const rawMaxX = Math.max(...all.map((n) => n.x + n.width));
  const rawMaxY = Math.max(...all.map((n) => n.y + n.height));

  // Offset dịch về (SAFE_PAD, SAFE_PAD)
  const offX = SAFE_PAD - rawMinX;
  const offY = SAFE_PAD - rawMinY;

  const nodes: Record<string, NormalizedNode> = {};
  for (const n of all) {
    nodes[n.id] = {
      id: n.id,
      x: n.x + offX,
      y: n.y + offY,
      width: n.width,
      height: n.height,
      branchIndex: n.branchIndex,
    };
  }

  const contentWidth = rawMaxX + offX + EXTRA_RIGHT;
  const contentHeight = rawMaxY + offY + SAFE_PAD;

  return { nodes, contentWidth, contentHeight };
}

export default function MindMap({ data, onDataChange, onFitReady }: Props) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(0);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const userInteracted = useRef(false);
  const fitScaleRef = useRef(1);

  const rawLayout = useMemo(() => calculateLayout(data), [data]);
  const { normalizedNodes, contentWidth, contentHeight } = useMemo(
    () => normalizeLayout(rawLayout),
    [rawLayout],
  );

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  }, []);

  const computeFit = useCallback(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;
    if (contentWidth <= 0 || contentHeight <= 0) return;

    const isMobile = containerSize.width < 768;
    const pad = isMobile ? 20 : 32;

    const fitScale = Math.min(
      (containerSize.width - pad * 2) / contentWidth,
      (containerSize.height - pad * 2) / contentHeight,
      isMobile ? 1 : 1.15,
    );
    const clamped = Math.max(isMobile ? 0.35 : 0.4, fitScale);
    fitScaleRef.current = clamped;

    // Center content in container
    const offX = (containerSize.width - contentWidth * clamped) / 2;
    const offY = (containerSize.height - contentHeight * clamped) / 2;

    scale.value = withTiming(clamped, { duration: 350 });
    savedScale.value = clamped;
    translateX.value = withTiming(offX, { duration: 350 });
    savedTX.value = offX;
    translateY.value = withTiming(offY, { duration: 350 });
    savedTY.value = offY;
  }, [containerSize, contentWidth, contentHeight]);

  useEffect(() => {
    if (userInteracted.current) return;
    computeFit();
  }, [computeFit]);

  useEffect(() => {
    if (onFitReady) onFitReady(() => { userInteracted.current = false; computeFit(); });
  }, [computeFit, onFitReady]);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const minS = fitScaleRef.current * 0.3;
      const maxS = Math.max(fitScaleRef.current * 3, 3);
      scale.value = Math.max(minS, Math.min(maxS, savedScale.value * e.scale));
    })
    .onEnd(() => { savedScale.value = scale.value; runOnJS(setUser)(); });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTX.value + e.translationX;
      translateY.value = savedTY.value + e.translationY;
    })
    .onEnd(() => {
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
      runOnJS(setUser)();
    });

  function setUser() { userInteracted.current = true; }

  const gesture = Gesture.Simultaneous(pinch, pan);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const toggleCollapse = useCallback((nodeId: string) => {
    const nodes = { ...data.nodes };
    nodes[nodeId] = { ...nodes[nodeId], collapsed: !nodes[nodeId].collapsed };
    onDataChange({ ...data, nodes });
    userInteracted.current = false;
  }, [data, onDataChange]);

  const addChild = useCallback((parentId: string) => {
    const newId = generateId();
    const parent = data.nodes[parentId];
    const nodes = {
      ...data.nodes,
      [parentId]: { ...parent, children: [...parent.children, newId] },
      [newId]: { id: newId, text: 'Node mới', x: 0, y: 0, color: '#FFFFFF', children: [], parentId, collapsed: false } as MindMapNode,
    };
    onDataChange({ ...data, nodes });
    userInteracted.current = false;
  }, [data, onDataChange]);

  const visibleNodes = Object.values(data.nodes).filter(
    (n) => normalizedNodes[n.id] && isVisible(data, n),
  );

  const cw = containerSize.width || 400;
  const ch = containerSize.height || 400;

  // Helper: lấy normalized layout cho 1 node
  const nl = (id: string) => normalizedNodes[id]!;

  return (
    <View style={styles.container} onLayout={onContainerLayout} collapsable={false}>
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <GestureDetector gesture={gesture}>
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
              <Svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`}>
                <Defs>
                  <LinearGradient id="rootGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#7C5CFC" />
                    <Stop offset="1" stopColor="#B4A0FF" />
                  </LinearGradient>
                  <Filter id="sh" x="-10%" y="-10%" width="125%" height="135%">
                    <FeDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#7C5CFC" floodOpacity="0.08" />
                  </Filter>
                  <Filter id="shR" x="-10%" y="-10%" width="125%" height="135%">
                    <FeDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#7C5CFC" floodOpacity="0.22" />
                  </Filter>
                </Defs>

                {/* Decorative blobs */}
                <Circle cx={cw * 0.15} cy={ch * 0.2} r={80} fill={Colors.blobPurple} />
                <Circle cx={cw * 0.75} cy={ch * 0.7} r={100} fill={Colors.blobBlue} />
                <Circle cx={cw * 0.5} cy={ch * 0.15} r={60} fill={Colors.blobPink} />
                <Circle cx={cw * 0.85} cy={ch * 0.3} r={50} fill={Colors.blobPurple} />

                {/* Connections - dùng tọa độ normalized */}
                {visibleNodes.map((node) => {
                  if (!node.parentId) return null;
                  const p = nl(node.parentId);
                  const c = nl(node.id);
                  if (!p || !c) return null;

                  const sx = p.x + p.width;
                  const sy = p.y + p.height / 2;
                  const ex = c.x;
                  const ey = c.y + c.height / 2;
                  const dx = ex - sx;
                  const dy = ey - sy;

                  const branchColor = c.branchIndex >= 0
                    ? BranchColors[c.branchIndex % BranchColors.length]?.accent
                    : Colors.connectionLine;

                  return (
                    <Path
                      key={`c-${node.id}`}
                      d={`M${sx},${sy} C${sx + dx * 0.4},${sy + dy * 0.05} ${ex - dx * 0.35},${ey - dy * 0.05} ${ex},${ey}`}
                      fill="none"
                      stroke={branchColor}
                      strokeWidth={2}
                      strokeLinecap="round"
                      opacity={0.35}
                    />
                  );
                })}

                {/* Nodes - dùng tọa độ normalized */}
                {visibleNodes.map((node) => {
                  const n = nl(node.id);
                  const isRoot = node.id === data.rootId;
                  const { width: w, height: h } = n;
                  const branchIdx = n.branchIndex;
                  const branchTheme = branchIdx >= 0 ? BranchColors[branchIdx % BranchColors.length] : null;

                  const bgColor = isRoot ? 'url(#rootGrad)' : (node.color || '#FFFFFF');
                  const txtColor = node.textColor || Colors.textDark;
                  const rx = isRoot ? NodeConfig.rootRadius : (
                    node.parentId && node.parentId !== data.rootId ? NodeConfig.subNodeRadius : NodeConfig.nodeRadius
                  );
                  const borderColor = isRoot ? 'transparent' : (branchTheme?.border || Colors.nodeBorder);

                  return (
                    <G key={node.id}>
                      <Rect
                        x={n.x} y={n.y} width={w} height={h}
                        rx={rx} ry={rx}
                        fill={bgColor}
                        filter={isRoot ? 'url(#shR)' : 'url(#sh)'}
                      />
                      {!isRoot && (
                        <Rect
                          x={n.x} y={n.y} width={w} height={h}
                          rx={rx} ry={rx}
                          fill="transparent"
                          stroke={borderColor}
                          strokeWidth={1.2}
                        />
                      )}
                      {!isRoot && node.parentId === data.rootId && branchTheme && (
                        <Rect
                          x={n.x} y={n.y + 6} width={3} height={h - 12}
                          rx={1.5} ry={1.5} fill={branchTheme.accent} opacity={0.6}
                        />
                      )}
                      <ForeignObject x={n.x} y={n.y} width={w} height={h}>
                        <View style={[styles.nodeLabel, isRoot && { paddingHorizontal: 12 }]}>
                          <Text
                            style={[styles.nodeText, { color: txtColor }, isRoot && styles.rootText]}
                            numberOfLines={2}
                          >
                            {node.text}
                          </Text>
                        </View>
                      </ForeignObject>

                      <ForeignObject x={n.x + w + 3} y={n.y + h / 2 - 10} width={24} height={24}>
                        <TouchableOpacity onPress={() => addChild(node.id)} style={styles.addBtn} activeOpacity={0.7}>
                          <Text style={styles.addIco}>+</Text>
                        </TouchableOpacity>
                      </ForeignObject>

                      {node.children.length > 0 && (
                        <ForeignObject x={n.x + w - 20} y={n.y + h / 2 - 8} width={18} height={18}>
                          <TouchableOpacity onPress={() => toggleCollapse(node.id)} style={styles.colBtn} activeOpacity={0.7}>
                            <Text style={styles.colIco}>{node.collapsed ? '▾' : '▴'}</Text>
                          </TouchableOpacity>
                        </ForeignObject>
                      )}
                    </G>
                  );
                })}
              </Svg>
            </Animated.View>
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  nodeLabel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  nodeText: {
    fontSize: 11,
    textAlign: 'center',
    color: Colors.textDark,
    lineHeight: 14,
  },
  rootText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 17,
  },
  addBtn: {
    width: NodeConfig.addButtonSize,
    height: NodeConfig.addButtonSize,
    borderRadius: NodeConfig.addButtonSize / 2,
    backgroundColor: Colors.addButtonLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIco: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: -1,
  },
  colBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F5F2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colIco: {
    fontSize: 9,
    color: Colors.primary,
    marginTop: -1,
  },
});
