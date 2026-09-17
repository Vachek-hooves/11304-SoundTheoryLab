import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useLayout } from '../hooks/useLayout';
import { useReducedMotion } from '../hooks/useReducedMotion';
export function Entrance({
  children,
  style,
  animationKey,
  active = true,
  delay = 0,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  animationKey?: string | number;
  active?: boolean;
  delay?: number;
}>) {
  const value = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const { motionDistance, motionDuration } = useLayout();
  useEffect(() => {
    if (reduced || !active) {
      value.setValue(1);
      return;
    }
    value.setValue(0);
    const animation = Animated.timing(value, {
      toValue: 1,
      duration: motionDuration,
      delay: Math.min(Math.max(0, delay), 200),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [value, reduced, motionDuration, animationKey, active, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: value,
          transform: [
            {
              translateY: value.interpolate({
                inputRange: [0, 1],
                outputRange: [motionDistance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
