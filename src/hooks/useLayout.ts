import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../theme';
export function useLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableHeight = height - insets.top - insets.bottom;
  const compact = width < 375 || availableHeight < 680;
  const narrow = width < 350 || fontScale > 1.25;
  return {
    width,
    height,
    fontScale,
    insets,
    availableHeight,
    compact,
    narrow,
    gutter: width < 350 ? 12 : compact ? 16 : 20,
    gap: compact ? 12 : 16,
    titleSize: compact ? 25 : 29,
    heroSize: Math.max(
      100,
      Math.min(width - 24, availableHeight * (compact ? 0.36 : 0.44), 440),
    ),
    motionDistance: compact ? 8 : 16,
    motionDuration: compact ? 220 : 320,
  };
}
export function useResponsiveStyles() {
  const { compact } = useLayout();
  return useMemo(
    () => ({
      ...styles,
      title: { ...styles.title, fontSize: compact ? 25 : 29, flexShrink: 1 },
      heading: {
        ...styles.heading,
        fontSize: compact ? 18 : 20,
        flexShrink: 1,
      },
      text: { ...styles.text, flexShrink: 1 },
      muted: { ...styles.muted, flexShrink: 1 },
      label: {
        ...styles.label,
        letterSpacing: compact ? 1.1 : 1.7,
        flexShrink: 1,
      },
      card: {
        ...styles.card,
        padding: compact ? 13 : 17,
        gap: compact ? 10 : 12,
      },
      chip: { ...styles.chip, paddingHorizontal: compact ? 9 : 12 },
    }),
    [compact],
  );
}
