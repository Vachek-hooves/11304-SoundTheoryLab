import React, {useEffect, useRef} from 'react';
import {Image, View, Animated, StyleSheet} from 'react-native';

const bgImage = require('../src/assets/Rectangle 5.png');

const DOT_SIZE = 16;
const DOT_COLOR = '#e6b75f';
const DURATION = 500;

const Dot = () => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: DURATION,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = anim.interpolate({inputRange: [0, 1], outputRange: [1, 1.7]});
  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <Animated.View style={[styles.dot, {transform: [{scale}], opacity}]} />
  );
};

const WelcomeScreen = () => (
  <View style={styles.bg}>
    <Image
      source={bgImage}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    />
    <View style={styles.overlay}>
      <View style={styles.row}>
        <Dot />
        <Dot />
        <Dot />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  bg: {flex: 1},
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 72,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: DOT_COLOR,
  },
});

export default WelcomeScreen;
