import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

const Card = forwardRef<View, { style?: any; children: React.ReactNode }>(
  ({ style, children }, ref) => (
    <View
      ref={ref}
      style={[styles.card, style]}
    >
      {children}
    </View>
  )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<View, { style?: any; children: React.ReactNode }>(
  ({ style, children }, ref) => (
    <View
      ref={ref}
      style={[styles.header, style]}
    >
      {children}
    </View>
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<Text, { style?: any; children: React.ReactNode }>(
  ({ style, children }, ref) => (
    <Text
      ref={ref}
      style={[styles.title, style]}
    >
      {children}
    </Text>
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<Text, { style?: any; children: React.ReactNode }>(
  ({ style, children }, ref) => (
    <Text
      ref={ref}
      style={[styles.description, style]}
    >
      {children}
    </Text>
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<View, { style?: any; children: React.ReactNode }>(
  ({ style, children }, ref) => (
    <View
      ref={ref}
      style={[styles.content, style]}
    >
      {children}
    </View>
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<View, { style?: any; children: React.ReactNode }>(
  ({ style, children }, ref) => (
    <View
      ref={ref}
      style={[styles.footer, style]}
    >
      {children}
    </View>
  )
);
CardFooter.displayName = 'CardFooter';

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'column',
    padding: 24,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 0,
  },
});

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };