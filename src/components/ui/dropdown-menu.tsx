import React, { forwardRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// DropdownMenu Context to manage state
interface DropdownMenuContextProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextProps | null>(null);

const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const context = React.useContext(DropdownMenuContext);

  return (
    <Pressable style={style} onPress={() => context?.setOpen(!context?.isOpen)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, {})
          : child
      )}
    </Pressable>
  );
};

const DropdownMenuGroup: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.group, style]}>{children}</View>
);

const DropdownMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

const DropdownMenuSub: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubOpen, setSubOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen: isSubOpen, setOpen: setSubOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuRadioGroup: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.radioGroup, style]}>{children}</View>
);

interface DropdownMenuSubTriggerProps {
  style?: any;
  inset?: boolean;
  children: React.ReactNode;
}

const DropdownMenuSubTrigger = forwardRef<TouchableOpacity, DropdownMenuSubTriggerProps>(
  ({ style, inset, children }, ref) => {
    const context = React.useContext(DropdownMenuContext);

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
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

interface DropdownMenuSubContentProps {
  style?: any;
  children: React.ReactNode;
}

const DropdownMenuSubContent = forwardRef<View, DropdownMenuSubContentProps>(({ style, children }, ref) => {
  const context = React.useContext(DropdownMenuContext);
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
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

interface DropdownMenuContentProps {
  style?: any;
  sideOffset?: number;
  children: React.ReactNode;
}

const DropdownMenuContent = forwardRef<View, DropdownMenuContentProps>(
  ({ style, sideOffset = 4, children }, ref) => {
    const context = React.useContext(DropdownMenuContext);
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
            style={[styles.content, { marginTop: sideOffset, opacity: fadeAnim }, style]}
          >
            {children}
          </Animated.View>
        </Pressable>
      </Modal>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

interface DropdownMenuItemProps {
  style?: any;
  inset?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const DropdownMenuItem = forwardRef<TouchableOpacity, DropdownMenuItemProps>(
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
DropdownMenuItem.displayName = 'DropdownMenuItem';

interface DropdownMenuCheckboxItemProps {
  style?: any;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children: React.ReactNode;
}

const DropdownMenuCheckboxItem = forwardRef<TouchableOpacity, DropdownMenuCheckboxItemProps>(
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
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

interface DropdownMenuRadioItemProps {
  style?: any;
  value: string;
  onSelect?: (value: string) => void;
  children: React.ReactNode;
}

const DropdownMenuRadioItem = forwardRef<TouchableOpacity, DropdownMenuRadioItemProps>(
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
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

interface DropdownMenuLabelProps {
  style?: any;
  inset?: boolean;
  children: React.ReactNode;
}

const DropdownMenuLabel = forwardRef<Text, DropdownMenuLabelProps>(
  ({ style, inset, children }, ref) => (
    <Text
      ref={ref}
      style={[styles.label, inset && styles.inset, style]}
    >
      {children}
    </Text>
  )
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

interface DropdownMenuSeparatorProps {
  style?: any;
}

const DropdownMenuSeparator = forwardRef<View, DropdownMenuSeparatorProps>(
  ({ style }, ref) => (
    <View
      ref={ref}
      style={[styles.separator, style]}
    />
  )
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

interface DropdownMenuShortcutProps {
  style?: any;
  children: React.ReactNode;
}

const DropdownMenuShortcut: React.FC<DropdownMenuShortcutProps> = ({ style, children }) => (
  <Text style={[styles.shortcut, style]}>{children}</Text>
);
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

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
    backgroundColor: '#d1d5db',
    marginVertical: 4,
    marginHorizontal: -4,
  },
  shortcut: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#6b7280',
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.5,
  },
});

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};