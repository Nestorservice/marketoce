import React, { forwardRef } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

interface AvatarProps {
  style?: any;
  children: React.ReactNode;
}

const Avatar = forwardRef<View, AvatarProps>(({ style, children }, ref) => (
  <View
    ref={ref}
    style={[styles.avatar, style]}
  >
    {children}
  </View>
));
Avatar.displayName = 'Avatar';

interface AvatarImageProps {
  style?: any;
  source: { uri: string };
}

const AvatarImage = forwardRef<Image, AvatarImageProps>(({ style, source }, ref) => (
  <Image
    ref={ref}
    source={source}
    style={[styles.avatarImage, style]}
  />
));
AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps {
  style?: any;
  children: React.ReactNode;
}

const AvatarFallback = forwardRef<View, AvatarFallbackProps>(({ style, children }, ref) => (
  <View
    ref={ref}
    style={[styles.avatarFallback, style]}
  >
    {children}
  </View>
));
AvatarFallback.displayName = 'AvatarFallback';

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { Avatar, AvatarImage, AvatarFallback };