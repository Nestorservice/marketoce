import React, { forwardRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Pressable,
  LongPressGestureHandler,
  LongPressGestureHandlerStateChangeEvent,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Context for managing menu state
interface ContextMenuContextProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const ContextMenuContext = React.createContext<ContextMenuContextProps | null>(null);

const ContextMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <ContextMenuContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

const ContextMenuTrigger: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const context = React.useContext(ContextMenuContext);

  const handleLongPress = (event: LongPressGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === 4) { // State.ACTIVE
      context?.setOpen(true);
    }
  };

  return (
    <LongPressGestureHandler onHandlerStateChange={handleLongPress} minDurationMs={500}>
      <View style={style}>{children}</View>
    </LongPressGestureHandler>
  );
};

const ContextMenuGroup: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.group, style]}>{children}</View>
);

const ContextMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

const ContextMenuSub: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubOpen, setSubOpen] = useState(false);

  return (
    <ContextMenuContext.Provider value={{ isOpen: isSubOpen, setOpen: setSubOpen }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

const ContextMenuRadioGroup: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.radioGroup, style]}>{children}</View>
);

interface ContextMenuSubTriggerProps {
  style?: any;
  children: React.ReactNode;
  inset?: boolean;
}

const ContextMenuSubTrigger = forwardRef<TouchableOpacity, ContextMenuSubTriggerProps>(
  ({ style, children, inset }, ref) => {
    const context = React.useContext(ContextMenuContext);

    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.subTrigger, inset && styles.inset, context?.isOpen && styles.subTriggerOpen, style]}
        onPress={() => context?.setOpen(!context?.isOpen)}
        activeOpacity={0.7}
      >
        {children}
        <Icon name="chevron-right" size={16} color="#6b7280" style={styles.chevron} />
      </TouchableOpacity>
    );
  }
);
ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger';

interface ContextMenuSubContentProps {
  style?: any;
  children: React.ReactNode;
}

const ContextMenuSubContent = forwardRef<View, ContextMenuSubContentProps>(({ style, children }, ref) => {
  const context = React.useContext(ContextMenuContext);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: context?.isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [context?.isOpen, fadeAnim]);

  if (!context?.isOpen) return null;

  return (
    <Animated.View
      ref={ref}
      style={[styles.subContent, { opacity: fadeAnim }, style]}
    >
      {children}
    </Animated.View>
  );
});
ContextMenuSubContent.displayName = 'ContextMenuSubContent';

interface ContextMenuContentProps {
  style?: any;
  children: React.ReactNode;
}

const ContextMenuContent = forwardRef<View, ContextMenuContentProps>(({ style, children }, ref) => {
  const context = React.useContext(ContextMenuContext);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: context?.isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [context?.isOpen, fadeAnim]);

  return (
    <Modal
      visible={context?.isOpen}
      transparent
      animationType="none"
      onRequestClose={() => context?.setOpen(false)}
    >
      <Pressable style={styles.overlay} onPress={() => context?.setOpen(false)}>
        <Animated.View
          ref={ref}
          style={[styles.content, { opacity: fadeAnim }, style]}
        >
          {children}
        </Animated.View>
      </Pressable>
    </Modal>
  );
});
ContextMenuContent.displayName = 'ContextMenuContent';

interface ContextMenuItemProps {
  style?: any;
  inset?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const ContextMenuItem = forwardRef<TouchableOpacity, ContextMenuItemProps>(
  ({ style, inset, onSelect, disabled, children }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.item, inset && styles.inset, disabled && styles.disabled, style]}
      onPress={() => !disabled && onSelect?.()}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  )
);
ContextMenuItem.displayName = 'ContextMenuItem';

interface ContextMenuCheckboxItemProps {
  style?: any;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children: React.ReactNode;
}

const ContextMenuCheckboxItem = forwardRef<TouchableOpacity, ContextMenuCheckboxItemProps>(
  ({ style, checked, onCheckedChange, children }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.checkboxItem, style]}
      onPress={() => onCheckedChange?.(!checked)}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxIndicator}>
        {checked && <Icon name="check" size={14} color="#111827" />}
      </View>
      {children}
    </TouchableOpacity>
  )
);
ContextMenuCheckboxItem.displayName = 'ContextMenuCheckboxItem';

interface ContextMenuRadioItemProps {
  style?: any;
  value: string;
  onSelect?: (value: string) => void;
  children: React.ReactNode;
}

const ContextMenuRadioItem = forwardRef<TouchableOpacity, ContextMenuRadioItemProps>(
  ({ style, value, onSelect, children }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[styles.radioItem, style]}
      onPress={() => onSelect?.(value)}
      activeOpacity={0.7}
    >
      <View style={styles.radioIndicator}>
        {value && <View style={styles.radioDot} />}
      </View>
      {children}
    </TouchableOpacity>
  )
);
ContextMenuRadioItem.displayName = 'ContextMenuRadioItem';

interface ContextMenuLabelProps {
  style?: any;
  inset?: boolean;
  children: React.ReactNode;
}

const ContextMenuLabel = forwardRef<Text, ContextMenuLabelProps>(
  ({ style, inset, children }, ref) => (
    <Text
      ref={ref}
      style={[styles.label, inset && styles.inset, style]}
    >
      {children}
    </Text>
  )
);
ContextMenuLabel.displayName = 'ContextMenuLabel';

interface ContextMenuSeparatorProps {
  style?: any;
}

const ContextMenuSeparator = forwardRef<View, ContextMenuSeparatorProps>(
  ({ style }, ref) => (
    <View
      ref={ref}
      style={[styles.separator, style]}
    />
  )
);
ContextMenuSeparator.displayName = 'ContextMenuSeparator';

interface ContextMenuShortcutProps {
  style?: any;
  children: React.ReactNode;
}

const ContextMenuShortcut: React.FC<ContextMenuShortcutProps> = ({ style, children }) => (
  <Text style={[styles.shortcut, style]}>{children}</Text>
);
ContextMenuShortcut.displayName = 'ContextMenuShortcut';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    minWidth: 128,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  subContent: {
    minWidth: 128,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 4,
    marginLeft: 4,
  },
  group: {
    padding: 4,
  },
  radioGroup: {
    padding: 4,
  },
  subTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 4,
  },
  subTriggerOpen: {
    backgroundColor: '#f3f4f6',
    color: '#111827',
  },
  inset: {
    paddingLeft: 32,
  },
  chevron: {
    marginLeft: 'auto',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 4,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 32,
    paddingRight: 8,
    borderRadius: 4,
  },
  checkboxIndicator: {
    position: 'absolute',
    left: 8,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 32,
    paddingRight: 8,
    borderRadius: 4,
  },
  radioIndicator: {
    position: 'absolute',
    left: 8,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111827',
  },
  label: {
    padding: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
    marginHorizontal: -4,
  },
  shortcut: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#6b7280',
  },
  disabled: {
    opacity: 0.5,
  },
});

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};