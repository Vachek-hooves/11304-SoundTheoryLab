import React from 'react';
import { StyleSheet, View } from 'react-native';
import NativeLinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient';

export function GradientSurface({
  children,
  style,
  colors,
  start,
  end,
  locations,
  useAngle,
  angleCenter,
  angle,
  ...props
}: LinearGradientProps) {
  return (
    <View {...props} style={[style, styles.surface]}>
      <NativeLinearGradient
        colors={colors}
        start={start}
        end={end}
        locations={locations}
        useAngle={useAngle}
        angleCenter={angleCenter}
        angle={angle}
        pointerEvents="none"
        accessible={false}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ surface: { overflow: 'hidden' } });
