import React, { useState } from 'react';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Lịch sử 10 &gt; Kháng chiến chống Pháp</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.headerInfo}>
            <Ionicons name="person-circle-outline" size={28} color="#FFF" />
            <Text style={styles.headerUser}>Đăng!</Text>
          </View>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>1,250</Text>
          </View>
          <View style={styles.notifBadge}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
            <View style={styles.notifDot}>
              <Text style={styles.notifCount}>7</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-vertical" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mind Map */}
      <MindMap data={data} onDataChange={setData} />

      {/* Bottom toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn}>
          <Ionicons name="grid-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.headerBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.headerBg,
  },
  headerBtn: {
    padding: 4,
  },
  breadcrumb: {
    flex: 1,
    marginLeft: 12,
  },
  breadcrumbText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerUser: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  coinBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  coinText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notifBadge: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#FF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifCount: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  toolBtn: {
    padding: 8,
  },
});
