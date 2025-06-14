import React, { forwardRef, useState, useImperativeHandle } from 'react';
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

// Dialog Context to manage state
const DialogContext = React.createContext<{
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}>({ isOpen: false, setOpen: () => {} });

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open: controlledOpen, onOpenChange, children }) => {
  const [isOpen, setOpen] = useState(controlledOpen || false);

  React.useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen);
    }
  }, [controlledOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ isOpen, setOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

interface DialogTriggerProps {
  children: React.ReactNode;
  style?: any;
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, style }) => {
  const { setOpen } = React.useContext(DialogContext);

  return (
    <Pressable style={style} onPress={() => setOpen(true)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, {})
          : child
      )}
    </Pressable>
  );
};

const DialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const DialogClose: React.FC<{ children?: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { setOpen } = React.useContext(DialogContext);

  return (
    <TouchableOpacity style={style} onPress={() => setOpen(false)} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

interface DialogOverlayProps {
  style?: any;
}

const DialogOverlay = forwardRef<View, DialogOverlayProps>(({ style }, ref) => {
  const { setOpen } = React.useContext(DialogContext);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      ref={ref}
      style={[styles.overlay, { opacity: fadeAnim }, style]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
    </Animated.View>
  );
});
DialogOverlay.displayName = 'DialogOverlay';

interface DialogContentProps {
  style?: any;
  children: React.ReactNode;
}

const DialogContent = forwardRef<View, DialogContentProps>(({ style, children }, ref) => {
  const { isOpen, setOpen } = React.useContext(DialogContext);
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, scaleAnim]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={() => setOpen(false)}
    >
      <DialogOverlay />
      <Animated.View
        ref={ref}
        style={[styles.content, { transform: [{ scale: scaleAnim }] }, style]}
      >
        {children}
        <DialogClose style={styles.closeButton}>
          <Icon name="close" size={16} color="#6b7280" />
          <Text style={styles.srOnly}>Close</Text>
        </DialogClose>
      </Animated.View>
    </Modal>
  );
});
DialogContent.displayName = 'DialogContent';

interface DialogHeaderProps {
  style?: any;
  children: React.ReactNode;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ style, children }) => (
  <View style={[styles.header, style]}>{children}</View>
);
DialogHeader.displayName = 'DialogHeader';

interface DialogFooterProps {
  style?: any;
  children: React.ReactNode;
}

const DialogFooter: React.FC<DialogFooterProps> = ({ style, children }) => (
  <View style={[styles.footer, style]}>{children}</View>
);
DialogFooter.displayName = 'DialogFooter';

interface DialogTitleProps {
  style?: any;
  children: React.ReactNode;
}

const DialogTitle = forwardRef<Text, DialogTitleProps>(({ style, children }, ref) => (
  <Text ref={ref} style={[styles.title, style]}>
    {children}
  </Text>
));
DialogTitle.displayName = 'DialogTitle';

interface DialogDescriptionProps {
  style?: any;
  children: React.ReactNode;
}

const DialogDescription = forwardRef<Text, DialogDescriptionProps>(({ style, children }, ref) => (
  <Text ref={ref} style={[styles.description, style]}>
    {children}
  </Text>
));
DialogDescription.displayName = 'DialogDescription';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 50,
  },
  content: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    zIndex: 51,
    gap: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  footer: {
    flexDirection: 'column-reverse',
    alignItems: 'stretch',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};