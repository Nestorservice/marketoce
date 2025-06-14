import React, { forwardRef, useContext, useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from './Button'; // Assuming Button is already converted for React Native CLI

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
};

type CarouselProps = {
  opts?: { loop?: boolean };
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
  style?: any;
  children: React.ReactNode;
};

type CarouselContextProps = {
  scrollViewRef: React.RefObject<ScrollView>;
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}

const Carousel = forwardRef<View, CarouselProps>(
  (
    {
      orientation = 'horizontal',
      opts = {},
      setApi,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(true);
    const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const scrollPrev = useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: orientation === 'horizontal' ? -containerSize.width : 0,
          y: orientation === 'vertical' ? -containerSize.height : 0,
          animated: true,
        });
      }
    }, [containerSize, orientation]);

    const scrollNext = useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: orientation === 'horizontal' ? containerSize.width : 0,
          y: orientation === 'vertical' ? containerSize.height : 0,
          animated: true,
        });
      }
    }, [containerSize, orientation]);

    const canScrollPrevFn = useCallback(() => {
      return canScrollPrev;
    }, [canScrollPrev]);

    const canScrollNextFn = useCallback(() => {
      return canScrollNext;
    }, [canScrollNext]);

    const api: CarouselApi = {
      scrollPrev,
      scrollNext,
      canScrollPrev: canScrollPrevFn,
      canScrollNext: canScrollNextFn,
    };

    useEffect(() => {
      if (setApi) {
        setApi(api);
      }
    }, [setApi, api]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize: scrollContentSize, layoutMeasurement } = event.nativeEvent;
      const offset = orientation === 'horizontal' ? contentOffset.x : contentOffset.y;
      const size = orientation === 'horizontal' ? scrollContentSize.width : scrollContentSize.height;
      const container = orientation === 'horizontal' ? layoutMeasurement.width : layoutMeasurement.height;

      setCanScrollPrev(offset > 0);
      setCanScrollNext(offset < size - container);
    };

    return (
      <CarouselContext.Provider
        value={{
          scrollViewRef,
          api,
          opts,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <View
          ref={ref}
          style={[styles.carousel, style]}
          accessibilityRole="region"
          accessibilityLabel="carousel"
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setContainerSize({ width, height });
          }}
          {...props}
        >
          {children}
        </View>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = 'Carousel';

const CarouselContent = forwardRef<View, { style?: any; children: React.ReactNode }>(
  ({ style, ...props }, ref) => {
    const { scrollViewRef, orientation } = useCarousel();

    return (
      <ScrollView
        ref={scrollViewRef}
        horizontal={orientation === 'horizontal'}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.contentContainer}
        contentContainerStyle={[
          orientation === 'horizontal' ? styles.horizontalContent : styles.verticalContent,
          style,
        ]}
        onContentSizeChange={(width, height) => {
          // Update content size when children are rendered
        }}
        {...props}
      >
        <View
          ref={ref}
          style={[
            orientation === 'horizontal' ? styles.horizontalItems : styles.verticalItems,
          ]}
        >
          {children}
        </View>
      </ScrollView>
    );
  }
);
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = forwardRef<View, { style?: any; children: React.ReactNode }>(
  ({ style, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
      <View
        ref={ref}
        accessibilityRole="group"
        accessibilityLabel="slide"
        style={[
          styles.item,
          orientation === 'horizontal' ? styles.horizontalItem : styles.verticalItem,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }
);
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = forwardRef<TouchableOpacity, { style?: any; variant?: string; size?: string }>(
  ({ style, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        style={[
          styles.navButton,
          orientation === 'horizontal'
            ? styles.prevHorizontal
            : styles.prevVertical,
          style,
        ]}
        disabled={!canScrollPrev}
        onPress={scrollPrev}
        {...props}
      >
        <Icon name="chevron-left" size={16} color="#374151" />
        <Text style={styles.srOnly}>Previous slide</Text>
      </Button>
    );
  }
);
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = forwardRef<TouchableOpacity, { style?: any; variant?: string; size?: string }>(
  ({ style, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        style={[
          styles.navButton,
          orientation === 'horizontal'
            ? styles.nextHorizontal
            : styles.nextVertical,
          style,
        ]}
        disabled={!canScrollNext}
        onPress={scrollNext}
        {...props}
      >
        <Icon name="chevron-right" size={16} color="#374151" />
        <Text style={styles.srOnly}>Next slide</Text>
      </Button>
    );
  }
);
CarouselNext.displayName = 'CarouselNext';

const styles = StyleSheet.create({
  carousel: {
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
  },
  horizontalContent: {
    flexDirection: 'row',
    paddingLeft: 16,
  },
  verticalContent: {
    flexDirection: 'column',
    paddingTop: 16,
  },
  horizontalItems: {
    flexDirection: 'row',
  },
  verticalItems: {
    flexDirection: 'column',
  },
  item: {
    flexShrink: 0,
    flexGrow: 0,
    width: '100%',
  },
  horizontalItem: {
    paddingRight: 16,
  },
  verticalItem: {
    paddingBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
  },
  prevHorizontal: {
    left: -48,
    top: '50%',
    transform: [{ translateY: -16 }],
  },
  nextHorizontal: {
    right: -48,
    top: '50%',
    transform: [{ translateY: -16 }],
  },
  prevVertical: {
    top: -48,
    left: '50%',
    transform: [{ translateX: -16 }, { rotate: '90deg' }],
  },
  nextVertical: {
    bottom: -48,
    left: '50%',
    transform: [{ translateX: -16 }, { rotate: '90deg' }],
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
  CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};