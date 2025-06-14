import React, { useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  style?: any;
}

const Collapsible: React.FC<CollapsibleProps> = ({ open: controlledOpen, onOpenChange, children, style }) => {
  const [isOpen, setIsOpen] = useState(controlledOpen || false);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  React.useEffect(() => {
    if (controlledOpen !== undefined) {
      setIsOpen(controlledOpen);
    }
  }, [controlledOpen]);

  return (
    <View style={style}>
      <CollapsibleContext.Provider value={{ isOpen, setOpen: handleOpenChange }}>
        {children}
      </CollapsibleContext.Provider>
    </View>
  );
};

interface CollapsibleContextProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextProps>({
  isOpen: false,
  setOpen: () => {},
});

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  style?: any;
}

const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({ children, style }) => {
  const { isOpen, setOpen } = React.useContext(CollapsibleContext);

  return (
    <TouchableOpacity
      style={style}
      onPress={() => setOpen(!isOpen)}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

interface CollapsibleContentProps {
  children: React.ReactNode;
  style?: any;
}

const CollapsibleContent: React.FC<CollapsibleContentProps> = ({ children, style }) => {
  const { isOpen } = React.useContext(CollapsibleContext);
  const heightAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen, heightAnim]);

  return (
    <Animated.View
      style={[
        styles.content,
        style,
        {
          opacity: heightAnim,
          height: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', 'auto'],
          }),
        },
      ]}
    >
      {isOpen && children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  content: {
    overflow: 'hidden',
  },
});

export { Collapsible, CollapsibleTrigger, CollapsibleContent };