import React from 'react';
import { View, StyleSheet } from 'react-native';

interface AspectRatioProps {
  ratio?: number;
  children: React.ReactNode;
  style?: any;
}

const AspectRatio: React.FC<AspectRatioProps> = ({ ratio = 1, children, style }) => {
  return (
    <View style={[styles.container, { paddingBottom: `${(1 / ratio) * 100}%` }, style]}>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export { AspectRatio };