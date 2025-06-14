import React, { forwardRef, useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Animated,
  Pressable,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Drawer Context to manage state
const DrawerContext = React.createContext<{
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}>({ isOpen: false, setOpen: () => {} });

interface DrawerProps {
  shouldScaleBackground?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({
  shouldScaleBackground = true,
  open: controlledOpen,
  onOpenChange,
  children,
}) => {
  const [isOpen, setOpen] = useState(controlledOpen || false);

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen);
    }
  }, [controlledOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DrawerContext.Provider value={{ isOpen, setOpen: handleOpenChange }}>
      {children}
    </DrawerContext.Provider>
  );
};
Drawer.displayName = 'Drawer';

interface DrawerTriggerProps {
  children: React.ReactNode;
  style?: any;
}

const DrawerTrigger: React.FC<DrawerTriggerProps> = ({ children, style }) => {
  const { setOpen } = React.useContext(DrawerContext);

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

const DrawerPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const DrawerClose: React.FC<{ children?: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { setOpen } = React.useContext(DrawerContext);

  return (
    <TouchableOpacity style={style} onPress={() => setOpen(false)} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

interface DrawerOverlayProps {
  style?: any;
}

const DrawerOverlay = forwardRef<View, DrawerOverlayProps>(({ style }, ref) => {
  const { setOpen } = React.useContext(DrawerContext);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
DrawerOverlay.displayName = 'DrawerOverlay';

interface DrawerContentProps {
  style?: any;
  children: React.ReactNode;
}

const DrawerContent = forwardRef<View, DrawerContentProps>(({ style, children }, ref) => {
  const { isOpen, setOpen } = React.useContext(DrawerContext);
  const translateY = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const screenHeight = Dimensions.get('window').height;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > screenHeight * 0.2 || gestureState.vy > 0.5) {
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setOpen(false));
      } else {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, translateY, screenHeight]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={() => setOpen(false)}
    >
      <DrawerOverlay />
      <Animated.View
        ref={ref}
        style={[styles.content, { transform: [{ translateY }] }, style]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  );
});
DrawerContent.displayName = 'DrawerContent';

interface DrawerHeaderProps {
  style?: any;
  children: React.ReactNode;
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ style, children }) => (
  <View style={[styles.header, style]}>{children}</View>
);
DrawerHeader.displayName = 'DrawerHeader';

interface DrawerFooterProps {
  style?: any;
  children: React.ReactNode;
}

const DrawerFooter: React.FC<DrawerFooterProps> = ({ style, children }) => (
  <View style={[styles.footer, style]}>{children}</View>
);
DrawerFooter.displayName = 'DrawerFooter';

interface DrawerTitleProps {
  style?: any;
  children: React.ReactNode;
}

const DrawerTitle = forwardRef<Text, DrawerTitleProps>(({ style, children }, ref) => (
  <Text ref={ref} style={[styles.title, style]}>
    {children}
  </Text>
));
DrawerTitle.displayName = 'DrawerTitle';

interface DrawerDescriptionProps {
  style?: any;
  children: React.ReactNode;
}

const DrawerDescription = forwardRef<Text, DrawerDescriptionProps>(({ style, children }, ref) => (
  <Text ref={ref} style={[styles.description, style]}>
    {children}
  </Text>
));
DrawerDescription.displayName = 'DrawerDescription';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 50,
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'column',
    zIndex: 51,
    paddingBottom: 16,
  },
  handle: {
    width: 100,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  header: {
    padding: 16,
    gap: 6,
    alignItems: 'center',
  },
  footer: {
    marginTop: 'auto',
    padding: 16,
    gap: 8,
    flexDirection: 'column',
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
});

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};