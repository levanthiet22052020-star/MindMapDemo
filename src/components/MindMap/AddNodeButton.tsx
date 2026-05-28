import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, NodeConfig } from '../../constants/theme';

interface Props {
  x: number;
  y: number;
  onPress: () => void;
}

export default function AddNodeButton({ x, y, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, { left: x, top: y }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: NodeConfig.addButtonSize,
    height: NodeConfig.addButtonSize,
    borderRadius: NodeConfig.addButtonSize / 2,
    backgroundColor: Colors.addButton,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -1,
  },
});
