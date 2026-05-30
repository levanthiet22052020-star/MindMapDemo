import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MindMap from '../components/MindMap';
import { MindMapData } from '../types/mindmap';
import { createInitialData } from '../utils/layout';
import { Colors } from '../constants/theme';

export default function MindMapScreen() {
  const [data, setData] = useState<MindMapData>(createInitialData());
  const fitViewFn = useRef<(() => void) | null>(null);
  const zoomInFn = useRef<(() => void) | null>(null);
  const zoomOutFn = useRef<(() => void) | null>(null);

  const onFitReady = useCallback((fitFn: () => void) => {
    fitViewFn.current = fitFn;
  }, []);

  const onZoomControlsReady = useCallback((controls: { zoomIn: () => void; zoomOut: () => void }) => {
    zoomInFn.current = controls.zoomIn;
    zoomOutFn.current = controls.zoomOut;
  }, []);

  const handleFit = useCallback(() => {
    fitViewFn.current?.();
  }, []);

  const handleZoomIn = useCallback(() => {
    zoomInFn.current?.();
  }, []);

  const handleZoomOut = useCallback(() => {
    zoomOutFn.current?.();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#5B3FD9" />

      {/* Home Top Bar */}
      <View style={styles.homeBar}>
        <View style={styles.homeBarTop}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>Đ</Text>
              </View>
            </View>
            <View style={styles.nameRow}>
              <Ionicons name="trophy" size={14} color="#FFEAA7" />
              <Text style={styles.nameText}>Đồng I</Text>
            </View>
          </View>
          <View style={styles.pills}>
            <View style={styles.pill}>
              <Ionicons name="ribbon-outline" size={12} color="#FFF" />
              <Text style={styles.pillText}>Đồng I</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="wallet-outline" size={12} color={Colors.pillText} />
              <Text style={[styles.pillText, { color: Colors.pillText }]}>1,250</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="flame-outline" size={12} color={Colors.fireOrange} />
              <Text style={[styles.pillText, { color: Colors.fireOrange }]}>5</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Branch Top Bar */}
      <View style={styles.branchBar}>
        <View style={styles.branchTop}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color="#8D99AE" />
          </TouchableOpacity>
          <Text style={styles.breadcrumb}>LỊCH SỬ 10 {'>'} CHƯƠNG I</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Sự học và đời sống</Text>
          <Text style={styles.subtitle}>Mind map</Text>
        </View>
      </View>

      {/* Mind Map + Toolbar */}
      <View style={styles.mapContainer}>
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={handleFit} style={styles.toolBtn} activeOpacity={0.7}>
            <Ionicons name="scan-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.zoomGroup}>
            <TouchableOpacity onPress={handleZoomIn} style={styles.zoomBtn} activeOpacity={0.7}>
              <Ionicons name="add" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity onPress={handleZoomOut} style={styles.zoomBtn} activeOpacity={0.7}>
              <Ionicons name="remove" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.toolBtn} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
        <MindMap data={data} onDataChange={setData} onFitReady={onFitReady} onZoomControlsReady={onZoomControlsReady} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#5B3FD9',
  },
  /* ── Home Top Bar (tím) ── */
  homeBar: {
    backgroundColor: '#5B3FD9',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  homeBarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nameText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  pillText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  /* ── Branch Top Bar (trắng) ── */
  branchBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  branchTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtn: {
    padding: 2,
    marginLeft: -4,
  },
  breadcrumb: {
    color: '#8D99AE',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  titleRow: { marginTop: 6, marginLeft: 0 },
  title: { color: '#2B2D42', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#8D99AE', fontSize: 12, marginTop: 2 },
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  toolbar: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    gap: 8,
  },
  toolBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  zoomGroup: {
    backgroundColor: '#FFF',
    borderRadius: 19,
    elevation: 4,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#F0EDFF',
    marginHorizontal: 6,
  },
});
