import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Button variants for React Native
const buttonVariants = (variant?: string, size?: string) => {
  const baseStyle = {
    ...styles.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
  };

  // Variant styles
  let variantStyle = {};
  switch (variant) {
    case 'destructive':
      variantStyle = {
        backgroundColor: '#ef4444',
        color: '#fff',
      };
      break;
    case 'outline':
      variantStyle = {
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#fff',
        color: '#374151',
      };
      break;
    case 'secondary':
      variantStyle = {
        backgroundColor: '#e5e7eb',
        color: '#374151',
      };
      break;
    case 'ghost':
      variantStyle = {
        backgroundColor: 'transparent',
        color: '#374151',
      };
      break;
    case 'link':
      variantStyle = {
        backgroundColor: 'transparent',
        color: '#2563eb',
        textDecorationLine: 'underline',
      };
      break;
    default:
      variantStyle = {
        backgroundColor: '#2563eb',
        color: '#fff',
      };
      break;
  }

  // Size styles
  let sizeStyle = {};
  switch (size) {
    case 'sm':
      sizeStyle = {
        height: 36,
        paddingHorizontal: 12,
        paddingVertical: 8,
      };
      break;
    case 'lg':
      sizeStyle = {
        height: 44,
        paddingHorizontal: 32,
        paddingVertical: 12,
      };
      break;
    case 'icon':
      sizeStyle = {
        height: 40,
        width: 40,
        padding: 0,
      };
      break;
    default:
      sizeStyle = {
        height: 40,
        paddingHorizontal: 16,
        paddingVertical: 8,
      };
      break;
  }

  return {
    ...baseStyle,
    ...variantStyle,
    ...sizeStyle,
  };
};

interface ButtonProps {
  style?: any;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

const Button = forwardRef<TouchableOpacity, ButtonProps>(
  ({ style, variant, size, asChild = false, children, onPress, disabled, ...props }, ref) => {
    const Comp = asChild ? View : TouchableOpacity;

    return (
      <Comp
        style={[
          buttonVariants(variant, size),
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {React.Children.map(children, (child) =>
          typeof child === 'string' ? (
            <Text
              style={[
                styles.text,
                variant === 'link' && styles.linkText,
                variant === 'outline' && styles.outlineText,
                variant === 'secondary' && styles.secondaryText,
                variant === 'ghost' && styles.ghostText,
              ]}
            >
              {child}
            </Text>
          ) : (
            child
          )
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  linkText: {
    color: '#2563eb',
  },
  outlineText: {
    color: '#374151',
  },
  secondaryText: {
    color: '#374151',
  },
  ghostText: {
    color: '#374151',
  },
  disabled: {
    opacity: 0.5,
  },
});

export { Button, buttonVariants };