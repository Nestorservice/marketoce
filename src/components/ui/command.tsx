import React, { forwardRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dialog, DialogContent } from './Dialog'; // Assuming Dialog is already converted for React Native CLI

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

interface CommandProps {
  style?: any;
  children: React.ReactNode;
}

const Command = forwardRef<View, CommandProps>(({ style, children }, ref) => (
  <View
    ref={ref}
    style={[styles.command, style]}
  >
    {children}
  </View>
));
Command.displayName = 'Command';

interface CommandDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const CommandDialog: React.FC<CommandDialogProps> = ({ open, onOpenChange, children }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={styles.dialogContent}>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
};

interface CommandInputProps {
  style?: any;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

const CommandInput = forwardRef<TextInput, CommandInputProps>(
  ({ style, value, onValueChange, placeholder, ...props }, ref) => (
    <View style={styles.inputWrapper}>
      <Icon name="search" size={16} color="#6b7280" style={styles.searchIcon} />
      <TextInput
        ref={ref}
        style={[styles.input, style]}
        value={value}
        onChangeText={onValueChange}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        {...props}
      />
    </View>
  )
);
CommandInput.displayName = 'CommandInput';

interface CommandListProps {
  style?: any;
  children: React.ReactNode;
}

const CommandList = forwardRef<View, CommandListProps>(({ style, children }, ref) => (
  <FlatList
    ref={ref}
    data={React.Children.toArray(children)}
    renderItem={({ item }) => item}
    keyExtractor={(_, index) => index.toString()}
    style={[styles.list, style]}
  />
));
CommandList.displayName = 'CommandList';

interface CommandEmptyProps {
  style?: any;
  children: React.ReactNode;
}

const CommandEmpty = forwardRef<Text, CommandEmptyProps>(({ style, children }, ref) => (
  <Text
    ref={ref}
    style={[styles.empty, style]}
  >
    {children}
  </Text>
));
CommandEmpty.displayName = 'CommandEmpty';

interface CommandGroupProps {
  style?: any;
  heading?: string;
  children: React.ReactNode;
}

const CommandGroup = forwardRef<View, CommandGroupProps>(
  ({ style, heading, children }, ref) => (
    <View ref={ref} style={[styles.group, style]}>
      {heading && <Text style={styles.groupHeading}>{heading}</Text>}
      {children}
    </View>
  )
);
CommandGroup.displayName = 'CommandGroup';

interface CommandSeparatorProps {
  style?: any;
}

const CommandSeparator = forwardRef<View, CommandSeparatorProps>(
  ({ style }, ref) => (
    <View ref={ref} style={[styles.separator, style]} />
  )
);
CommandSeparator.displayName = 'CommandSeparator';

interface CommandItemProps {
  style?: any;
  onSelect?: () => void;
  disabled?: boolean;
  selected?: boolean;
  children: React.ReactNode;
}

const CommandItem = forwardRef<TouchableOpacity, CommandItemProps>(
  ({ style, onSelect, disabled, selected, children }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[
        styles.item,
        selected && styles.itemSelected,
        disabled && styles.itemDisabled,
        style,
      ]}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  )
);
CommandItem.displayName = 'CommandItem';

interface CommandShortcutProps {
  style?: any;
  children: React.ReactNode;
}

const CommandShortcut: React.FC<CommandShortcutProps> = ({ style, children }) => (
  <Text style={[styles.shortcut, style]}>{children}</Text>
);
CommandShortcut.displayName = 'CommandShortcut';

const styles = StyleSheet.create({
  command: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  dialogContent: {
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
    opacity: 0.5,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    backgroundColor: 'transparent',
    color: '#111827',
  },
  list: {
    maxHeight: 300,
  },
  empty: {
    paddingVertical: 24,
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
  },
  group: {
    padding: 4,
  },
  groupHeading: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: -4,
  },
  item: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  itemSelected: {
    backgroundColor: '#f3f4f6',
    color: '#111827',
  },
  itemDisabled: {
    opacity: 0.5,
  },
  shortcut: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#6b7280',
  },
});

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};