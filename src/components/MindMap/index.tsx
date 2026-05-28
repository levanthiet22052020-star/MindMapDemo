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

// Extra space beyond node edges: button size, shadow spread, bezier overshoot
const EXTRA_LEFT = 12;
const EXTRA_RIGHT = NodeConfig.addButtonSize + 8;   // "+" button + gap
const EXTRA_TOP = 14;   // shadow + collapse button half
const EXTRA_BOTTOM = 14;
const SAFE_PAD_DESKTOP = 40;
const SAFE_PAD_MOBILE = 24;

function isVisible(data: MindMapData, node: MindMapNode): boolean {
  let current = node.parentId;
  while (current) {
    if (data.nodes[current]?.collapsed) return false;
    current = data.nodes[current]?.parentId;
  }
  return true;
}

function getExpandedBounds(layout: Record<string, LayoutNode>): {
  minX: number; minY: number; maxX: number; maxY: number;
} {
  const all = Object.values(layout);
  if (all.length === 0) return { minX: 0, minY: 0, maxX: 100, maxY: 100 };

  const minX = Math.min(...all.map((n) => n.x)) - EXTRA_LEFT;
  const minY = Math.min(...all.map((n) => n.y)) - EXTRA_TOP;
  const maxX = Math.max(...all.map((n) => n.x + n.width)) + EXTRA_RIGHT;
  const maxY = Math.max(...all.map((n) => n.y + n.height)) + EXTRA_BOTTOM;

  return { minX, minY, maxX, maxY };
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

  const layout = useMemo(() => calculateLayout(data), [data]);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  }, []);

  const computeFit = useCallback(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;

    const { minX, minY, maxX, maxY } = getExpandedBounds(layout);
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    if (contentW <= 0 || contentH <= 0) return;

    const isMobile = containerSize.width < 768;
    const pad = isMobile ? SAFE_PAD_MOBILE : SAFE_PAD_DESKTOP;

    const fitScale = Math.min(
      (containerSize.width - pad * 2) / contentW,
      (containerSize.height - pad * 2) / contentH,
      isMobile ? 1 : 1.15,
    );
    const clamped = Math.max(isMobile ? 0.35 : 0.4, fitScale);
    fitScaleRef.current = clamped;

    // Center expanded content in container
    const offX = (containerSize.width - contentW * clamped) / 2 - minX * clamped;
    const offY = (containerSize.height - contentH * clamped) / 2 - minY * clamped;

    scale.value = withTiming(clamped, { duration: 350 });
    savedScale.value = clamped;
    translateX.value = withTiming(offX, { duration: 350 });
    savedTX.value = offX;
    translateY.value = withTiming(offY, { duration: 350 });
    savedTY.value = offY;
  }, [containerSize, layout]);

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
    (n) => layout[n.id] && isVisible(data, n),
  );

  const cw = containerSize.width || 400;
  const ch = containerSize.height || 400;

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

                {/* Connections */}
                {visibleNodes.map((node) => {
                  if (!node.parentId) return null;
                  const pL = layout[node.parentId] as LayoutNode | undefined;
                  const cL = layout[node.id] as LayoutNode | undefined;
                  if (!pL || !cL) return null;

                  const sx = pL.x + pL.width;
                  const sy = pL.y + pL.height / 2;
                  const ex = cL.x;
                  const ey = cL.y + cL.height / 2;
                  const dx = ex - sx;
                  const dy = ey - sy;

                  const branchIdx = cL.branchIndex;
                  const branchColor = branchIdx >= 0 ? BranchColors[branchIdx % BranchColors.length]?.accent : Colors.connectionLine;

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

                {/* Nodes */}
                {visibleNodes.map((node) => {
                  const nl = layout[node.id] as LayoutNode;
                  const isRoot = node.id === data.rootId;
                  const { width: w, height: h } = nl;
                  const branchIdx = nl.branchIndex;
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
                        x={nl.x} y={nl.y} width={w} height={h}
                        rx={rx} ry={rx}
                        fill={bgColor}
                        filter={isRoot ? 'url(#shR)' : 'url(#sh)'}
                      />
                      {!isRoot && (
                        <Rect
                          x={nl.x} y={nl.y} width={w} height={h}
                          rx={rx} ry={rx}
                          fill="transparent"
                          stroke={borderColor}
                          strokeWidth={1.2}
                        />
                      )}
                      {!isRoot && node.parentId === data.rootId && branchTheme && (
                        <Rect
                          x={nl.x} y={nl.y + 6} width={3} height={h - 12}
                          rx={1.5} ry={1.5} fill={branchTheme.accent} opacity={0.6}
                        />
                      )}
                      <ForeignObject x={nl.x} y={nl.y} width={w} height={h}>
                        <View style={[styles.nodeLabel, isRoot && { paddingHorizontal: 12 }]}>
                          <Text
                            style={[styles.nodeText, { color: txtColor }, isRoot && styles.rootText]}
                            numberOfLines={2}
                          >
                            {node.text}
                          </Text>
                        </View>
                      </ForeignObject>

                      {/* Add button - bên phải node */}
                      <ForeignObject x={nl.x + w + 3} y={nl.y + h / 2 - 10} width={24} height={24}>
                        <TouchableOpacity onPress={() => addChild(node.id)} style={styles.addBtn} activeOpacity={0.7}>
                          <Text style={styles.addIco}>+</Text>
                        </TouchableOpacity>
                      </ForeignObject>

                      {/* Collapse toggle - trong node, góc phải */}
                      {node.children.length > 0 && (
                        <ForeignObject x={nl.x + w - 20} y={nl.y + h / 2 - 8} width={18} height={18}>
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
