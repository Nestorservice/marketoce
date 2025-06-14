import * as React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // Remplace lucide-react
import { cn } from '@/lib/utils'; // On suppose que cn est adapté pour retourner des objets de style

// Activer LayoutAnimation sur Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Type pour les props de Accordion
interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
}

// Composant principal Accordion
const Accordion: React.FC<AccordionProps> = ({ children, type = 'single', defaultValue }) => {
  const [openItems, setOpenItems] = React.useState<string[]>(Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []);

  const toggleItem = (value: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (type === 'single') {
      setOpenItems(openItems.includes(value) ? [] : [value]);
    } else {
      setOpenItems(
        openItems.includes(value)
          ? openItems.filter((item) => item !== value)
          : [...openItems, value]
      );
    }
  };

  return <View>{React.Children.map(children, (child) => React.cloneElement(child as any, { openItems, toggleItem }))}</View>;
};

// Type pour AccordionItem
interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  openItems?: string[];
  toggleItem?: (value: string) => void;
}

// Composant AccordionItem
const AccordionItem: React.FC<AccordionItemProps> = ({ value, children, openItems = [], toggleItem }) => {
  return (
    <View style={styles.item}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as any, { value, isOpen: openItems.includes(value), toggleItem })
      )}
    </View>
  );
};

// Type pour AccordionTrigger
interface AccordionTriggerProps {
  children: React.ReactNode;
  value?: string;
  isOpen?: boolean;
  toggleItem?: (value: string) => void;
}

// Composant AccordionTrigger
const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ children, value = '', isOpen, toggleItem }) => {
  const rotateAnim = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      onPress={() => toggleItem?.(value)}
      style={styles.trigger}
      activeOpacity={0.7}
    >
      <View style={styles.triggerContent}>
        <Text style={styles.triggerText}>{children}</Text>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <AntDesign name="down" size={16} color="#000" />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

// Type pour AccordionContent
interface AccordionContentProps {
  children: React.ReactNode;
  value?: string;
  isOpen?: boolean;
}

// Composant AccordionContent
const AccordionContent: React.FC<AccordionContentProps> = ({ children, isOpen }) => {
  return isOpen ? <View style={styles.content}>{children}</View> : null;
};

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  triggerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    paddingBottom: 16,
    paddingTop: 0,
  },
});

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };