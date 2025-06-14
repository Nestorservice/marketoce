import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Utility function to combine styles
const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

// Simplified variant styles for React Native
const alertVariants = (variant?: string) => {
  const baseStyle = {
    ...styles.alert,
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    color: '#111827',
  };

  if (variant === 'destructive') {
    return {
      ...baseStyle,
      borderColor: '#ef4444',
      color: '#ef4444',
    };
  }

  return baseStyle;
};

interface AlertProps {
  style?: any;
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
}

const Alert = forwardRef<View, AlertProps>(
  ({ style, variant = 'default', children }, ref) => (
    <View
      ref={ref}
      accessibilityRole="alert"
      style={[alertVariants(variant), style]}
    >
      {children}
    </View>
  )
);
Alert.displayName = 'Alert';

interface AlertTitleProps {
  style?: any;
  children: React.ReactNode;
}

const AlertTitle = forwardRef<Text, AlertTitleProps>(
  ({ style, children }, ref) => (
    <Text
      ref={ref}
      style={[styles.title, style]}
    >
      {children}
    </Text>
  )
);
AlertTitle.displayName = 'AlertTitle';

interface AlertDescriptionProps {
  style?: any;
  children: React.ReactNode;
}

const AlertDescription = forwardRef<View, AlertDescriptionProps>(
  ({ style, children }, ref) => (
    <View
      ref={ref}
      style={[styles.description, style]}
    >
      {React.Children.map(children, (child) =>
        typeof child === 'string' ? (
          <Text style={styles.descriptionText}>{child}</Text>
        ) : (
          child
        )
      )}
    </View>
  )
);
AlertDescription.displayName = 'AlertDescription';

const styles = StyleSheet.create({
  alert: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  description: {
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export { Alert, AlertTitle, AlertDescription };