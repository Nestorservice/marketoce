import React, { forwardRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

interface CheckboxProps {
  style?: any;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox = forwardRef<View, CheckboxProps>(
  ({ style, checked = false, onCheckedChange, disabled = false, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.checkbox,
          checked && styles.checked,
          disabled && styles.disabled,
          style,
        ]}
        onPress={() => !disabled && onCheckedChange?.(!checked)}
        disabled={disabled}
        activeOpacity={0.7}
        {...props}
      >
        {checked && (
          <Icon name="check" size={16} color="#fff" style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  }
);
Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#2563eb',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  disabled: {
    opacity: 0.5,
  },
  checkIcon: {
    color: '#fff',
  },
});

export { Checkbox };