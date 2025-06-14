import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Badge variants for React Native
const badgeVariants = (variant?: string) => {
  const baseStyle = styles.badge;

  switch (variant) {
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: '#e5e7eb',
        color: '#374151',
      };
    case 'destructive':
      return {
        ...baseStyle,
        backgroundColor: '#ef4444',
        color: '#fff',
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderColor: '#374151',
        color: '#374151',
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: '#2563eb',
        color: '#fff',
      };
  }
};

interface BadgeProps {
  style?: any;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ style, variant, children }) => {
  return (
    <View style={[badgeVariants(variant), style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export { Badge, badgeVariants };