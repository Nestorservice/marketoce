import React, { forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

const Breadcrumb = forwardRef<View, { style?: any; children: React.ReactNode }>(
  ({ style, children }, ref) => (
    <View
      ref={ref}
      accessibilityRole="navigation"
      accessibilityLabel="breadcrumb"
      style={[styles.breadcrumb, style]}
    >
      {children}
    </View>
  )
);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = forwardRef<View, { style?: any; children: React.ReactNode }>(
  ({ style, children }, ref) => (
    <View
      ref={ref}
      style={[styles.breadcrumbList, style]}
    >
      {children}
    </View>
  )
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = forwardRef<View, { style?: any; children: React.ReactNode }>(
  ({ style, children }, ref) => (
    <View
      ref={ref}
      style={[styles.breadcrumbItem, style]}
    >
      {children}
    </View>
  )
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

interface BreadcrumbLinkProps {
  style?: any;
  onPress?: () => void;
  asChild?: boolean;
  children: React.ReactNode;
}

const BreadcrumbLink = forwardRef<View, BreadcrumbLinkProps>(
  ({ style, onPress, asChild, children }, ref) => {
    const Comp = asChild ? View : TouchableOpacity;

    return (
      <Comp
        ref={ref}
        style={[styles.breadcrumbLink, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </Comp>
    );
  }
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = forwardRef<Text, { style?: any; children: React.ReactNode }>(
  ({ style, children }, ref) => (
    <Text
      ref={ref}
      accessibilityRole="link"
      accessibilityState={{ disabled: true }}
      style={[styles.breadcrumbPage, style]}
    >
      {children}
    </Text>
  )
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator: React.FC<{
  style?: any;
  children?: React.ReactNode;
}> = ({ style, children }) => (
  <View
    accessibilityRole="none"
    accessibilityHidden
    style={[styles.breadcrumbSeparator, style]}
  >
    {children ?? <Icon name="chevron-right" size={14} color="#6b7280" />}
  </View>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis: React.FC<{ style?: any }> = ({ style }) => (
  <View
    accessibilityRole="none"
    accessibilityHidden
    style={[styles.breadcrumbEllipsis, style]}
  >
    <Icon name="more-horiz" size={16} color="#6b7280" />
    <Text style={styles.srOnly}>More</Text>
  </View>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

const styles = StyleSheet.create({
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadcrumbLink: {
    color: '#6b7280',
  },
  breadcrumbPage: {
    fontSize: 14,
    color: '#111827',
  },
  breadcrumbSeparator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  breadcrumbEllipsis: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    borderWidth: 0,
  },
});

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};