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
import { Svg, G, Path, Rect, Defs, Filter, FeDropShadow, ForeignObject } from 'react-native-svg';
import { MindMapData, MindMapNode } from '../../types/mindmap';
import { Colors, NodeConfig } from '../../constants/theme';
import { calculateLayout, generateId } from '../../utils/layout';

interface Props {
  data: MindMapData;
  onDataChange: (data: MindMapData) => void;
  onFitReady?: (fitFn: () => void) => void;
}

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeHeight: number;
}

function isVisible(data: MindMapData, node: MindMapNode): boolean {
  let current = node.parentId;
  while (current) {
    if (data.nodes[current]?.collapsed) return false;
    current = data.nodes[current]?.parentId;
  }
  return true;
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

    const allLayouts = Object.values(layout);
    if (allLayouts.length === 0) return;

    const minX = Math.min(...allLayouts.map((n) => n.x));
    const minY = Math.min(...allLayouts.map((n) => n.y));
    const maxX = Math.max(...allLayouts.map((n) => n.x + n.width));
    const maxY = Math.max(...allLayouts.map((n) => n.y + n.height));

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    if (contentW <= 0 || contentH <= 0) return;

    const isMobile = containerSize.width < 768;
    const pad = isMobile ? 16 : 32;

    const fitScale = Math.min(
      (containerSize.width - pad * 2) / contentW,
      (containerSize.height - pad * 2) / contentH,
      isMobile ? 1 : 1.2,
    );
    const minScale = isMobile ? 0.35 : 0.4;
    const clamped = Math.max(minScale, fitScale);
    fitScaleRef.current = clamped;

    const offX = (containerSize.width - contentW * clamped) / 2 - minX * clamped;
    const offY = (containerSize.height - contentH * clamped) / 2 - minY * clamped;

    scale.value = withTiming(clamped, { duration: 300 });
    savedScale.value = clamped;
    translateX.value = withTiming(offX, { duration: 300 });
    savedTX.value = offX;
    translateY.value = withTiming(offY, { duration: 300 });
    savedTY.value = offY;
  }, [containerSize, layout]);

  // Auto-fit khi container hoặc layout thay đổi
  useEffect(() => {
    if (userInteracted.current) return;
    computeFit();
  }, [computeFit]);

  // Expose fitView cho parent (toolbar button)
  useEffect(() => {
    if (onFitReady) {
      onFitReady(() => {
        userInteracted.current = false;
        computeFit();
      });
    }
  }, [computeFit, onFitReady]);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const minS = fitScaleRef.current * 0.3;
      const maxS = Math.max(fitScaleRef.current * 3, 3);
      const next = Math.max(minS, Math.min(maxS, savedScale.value * e.scale));
      scale.value = next;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(setUserTrue)();
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTX.value + e.translationX;
      translateY.value = savedTY.value + e.translationY;
    })
    .onEnd(() => {
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
      runOnJS(setUserTrue)();
    });

  function setUserTrue() {
    userInteracted.current = true;
  }

  const gesture = Gesture.Simultaneous(pinch, pan);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const toggleCollapse = useCallback(
    (nodeId: string) => {
      const nodes = { ...data.nodes };
      nodes[nodeId] = { ...nodes[nodeId], collapsed: !nodes[nodeId].collapsed };
      onDataChange({ ...data, nodes });
      userInteracted.current = false;
    },
    [data, onDataChange],
  );

  const addChild = useCallback(
    (parentId: string) => {
      const newId = generateId();
      const parent = data.nodes[parentId];
      const nodes = {
        ...data.nodes,
        [parentId]: { ...parent, children: [...parent.children, newId] },
        [newId]: {
          id: newId,
          text: 'Node mới',
          x: 0, y: 0,
          color: '#FFFFFF',
          children: [],
          parentId,
          collapsed: false,
        } as MindMapNode,
      };
      onDataChange({ ...data, nodes });
      userInteracted.current = false;
    },
    [data, onDataChange],
  );

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
                  <Filter id="sh" x="-5%" y="-5%" width="115%" height="125%">
                    <FeDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#6C5CE7" floodOpacity="0.06" />
                  </Filter>
                  <Filter id="shR" x="-5%" y="-5%" width="115%" height="125%">
                    <FeDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#6C5CE7" floodOpacity="0.2" />
                  </Filter>
                </Defs>

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
                  const dx = (ex - sx) * 0.5;
                  return (
                    <Path
                      key={`c-${node.id}`}
                      d={`M${sx},${sy} C${sx + dx},${sy} ${ex - dx},${ey} ${ex},${ey}`}
                      fill="none"
                      stroke={Colors.connectionLine}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Nodes */}
                {visibleNodes.map((node) => {
                  const nl = layout[node.id] as LayoutNode;
                  const isRoot = node.id === data.rootId;
                  const { width: w, height: h } = nl;
                  const bgColor = node.color;
                  const txtColor = node.textColor || Colors.textDark;
                  const rx = isRoot ? NodeConfig.rootRadius : (
                    node.parentId && node.parentId !== data.rootId ? NodeConfig.subNodeRadius : NodeConfig.nodeRadius
                  );

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
                          stroke={Colors.nodeBorder}
                          strokeWidth={1}
                        />
                      )}
                      <ForeignObject x={nl.x} y={nl.y} width={w} height={h}>
                        <View style={styles.nodeLabel}>
                          <Text
                            style={[styles.nodeText, { color: txtColor }, isRoot && styles.rootText]}
                            numberOfLines={2}
                          >
                            {node.text}
                          </Text>
                        </View>
                      </ForeignObject>

                      {/* Add button */}
                      <ForeignObject x={nl.x + w + 2} y={nl.y + h / 2 - 9} width={20} height={20}>
                        <TouchableOpacity onPress={() => addChild(node.id)} style={styles.addBtn} activeOpacity={0.7}>
                          <Text style={styles.addIco}>+</Text>
                        </TouchableOpacity>
                      </ForeignObject>

                      {/* Collapse toggle */}
                      {node.children.length > 0 && (
                        <ForeignObject x={nl.x + w - 20} y={nl.y + h / 2 - 9} width={18} height={18}>
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
    paddingHorizontal: 6,
  },
  nodeText: {
    fontSize: 11,
    textAlign: 'center',
    color: Colors.textDark,
  },
  rootText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addBtn: {
    width: NodeConfig.addButtonSize,
    height: NodeConfig.addButtonSize,
    borderRadius: NodeConfig.addButtonSize / 2,
    backgroundColor: Colors.addButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIco: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -1,
  },
  colBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F0EDFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colIco: {
    fontSize: 9,
    color: Colors.primary,
    marginTop: -1,
  },
});
