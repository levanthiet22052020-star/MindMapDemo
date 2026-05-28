import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MindMap from '../components/MindMap';
import { MindMapData } from '../types/mindmap';
import { createInitialData } from '../utils/layout';
import { Colors } from '../constants/theme';

export default function MindMapScreen() {
  const [data, setData] = useState<MindMapData>(createInitialData());
  const fitViewFn = useRef<(() => void) | null>(null);

  const onFitReady = useCallback((fitFn: () => void) => {
    fitViewFn.current = fitFn;
  }, []);

  const handleFit = useCallback(() => {
    fitViewFn.current?.();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerTopBg} />

      {/* === Header === */}
      <View style={styles.header}>
        {/* Top row: back + avatar + pills */}
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>Đ</Text>
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

        {/* Breadcrumb */}
        <View style={styles.breadcrumbRow}>
          <Text style={styles.breadcrumb}>LỊCH SỬ 10 {'>'} CHƯƠNG I</Text>
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Sự học và đời sống</Text>
            <Text style={styles.subtitle}>Mind map</Text>
          </View>
        </View>
      </View>

      {/* === Mind Map Container === */}
      <View style={styles.mapContainer}>
        {/* Toolbar overlay */}
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={handleFit} style={styles.toolBtn} activeOpacity={0.7}>
            <Ionicons name="scan-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Mind map */}
        <MindMap data={data} onDataChange={setData} onFitReady={onFitReady} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.headerBg,
  },

  // === HEADER ===
  header: {
    backgroundColor: Colors.headerBg,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    padding: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pills: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.pillBg,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  pillText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  breadcrumbRow: {
    marginTop: 10,
    marginLeft: 4,
  },
  breadcrumb: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  titleRow: {
    marginTop: 4,
    marginLeft: 4,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 1,
  },

  // === MAP CONTAINER ===
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
