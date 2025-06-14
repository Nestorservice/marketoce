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

// Utility function to combine styles (similar to cn)
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Button variants (simplified for React Native)
const buttonVariants = (variant?: string) => {
  if (variant === 'outline') {
    return styles.buttonOutline;
  }
  return styles.buttonDefault;
};

// AlertDialog Context to manage state
const AlertDialogContext = React.createContext<{
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}>({ isOpen: false, setOpen: () => {} });

const AlertDialog: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setOpen] = useState(false);
  return (
    <AlertDialogContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <Pressable onPress={() => setOpen(true)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, {})
          : child
      )}
    </Pressable>
  );
};

const AlertDialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const AlertDialogOverlay = forwardRef<
  any,
  { style?: any; onPress?: () => void }
>(({ style, onPress }, ref) => {
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
      style={[styles.overlay, style, { opacity: fadeAnim }]}
      pointerEvents="auto"
    >
      {onPress && <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />}
    </Animated.View>
  );
});
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

const AlertDialogContent = forwardRef<
  any,
  { style?: any; children: React.ReactNode }
>(({ style, children }, ref) => {
  const { isOpen, setOpen } = React.useContext(AlertDialogContext);
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
      <AlertDialogOverlay onPress={() => setOpen(false)} />
      <Animated.View
        ref={ref}
        style={[styles.content, style, { transform: [{ scale: scaleAnim }] }]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
});
AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogHeader: React.FC<{
  style?: any;
  children: React.ReactNode;
}> = ({ style, children }) => (
  <View style={[styles.header, style]}>{children}</View>
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter: React.FC<{
  style?: any;
  children: React.ReactNode;
}> = ({ style, children }) => (
  <View style={[styles.footer, style]}>{children}</View>
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = forwardRef<
  any,
  { style?: any; children: React.ReactNode }
>(({ style, children }, ref) => (
  <Text ref={ref} style={[styles.title, style]}>
    {children}
  </Text>
));
AlertDialogTitle.displayName = 'AlertDialogTitle';

const AlertDialogDescription = forwardRef<
  any,
  { style?: any; children: React.ReactNode }
>(({ style, children }, ref) => (
  <Text ref={ref} style={[styles.description, style]}>
    {children}
  </Text>
));
AlertDialogDescription.displayName = 'AlertDialogDescription';

const AlertDialogAction = forwardRef<
  any,
  { style?: any; onPress?: () => void; children: React.ReactNode }
>(({ style, onPress, children }, ref) => {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <TouchableOpacity
      ref={ref}
      style={[buttonVariants(), style]}
      onPress={() => {
        onPress?.();
        setOpen(false);
      }}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </TouchableOpacity>
  );
});
AlertDialogAction.displayName = 'AlertDialogAction';

const AlertDialogCancel = forwardRef<
  any,
  { style?: any; onPress?: () => void; children: React.ReactNode }
>(({ style, onPress, children }, ref) => {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <TouchableOpacity
      ref={ref}
      style={[buttonVariants('outline'), styles.cancel, style]}
      onPress={() => {
        onPress?.();
        setOpen(false);
      }}
    >
      <Text style={styles.buttonOutlineText}>{children}</Text>
    </TouchableOpacity>
  );
});
AlertDialogCancel.displayName = 'AlertDialogCancel';

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    zIndex: 51,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'column-reverse',
    alignItems: 'stretch',
    marginTop: 16,
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
  buttonDefault: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonOutlineText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  cancel: {
    marginTop: 8,
  },
});

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};