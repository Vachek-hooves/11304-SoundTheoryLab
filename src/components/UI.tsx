import React, { PropsWithChildren, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { GradientSurface as LinearGradient } from './GradientSurface';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';
import { useLayout, useResponsiveStyles } from '../hooks/useLayout';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Entrance } from './Entrance';
import { useIsFocused } from '@react-navigation/native';
export function Screen({
  children,
  tab = false,
  animationKey,
}: PropsWithChildren<{ tab?: boolean; animationKey?: string | number }>) {
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  return (
    <LinearGradient
      colors={[colors.surfaceHighlight, colors.bg, '#400d22', '#57132e']}
      style={{ flex: 1 }}
      locations={[0, 0.17, 0.8, 1]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            padding: layout.gutter,
            paddingTop: insets.top + (layout.compact ? 8 : 15),
            paddingBottom: tab
              ? insets.bottom + (layout.compact ? 88 : 105)
              : insets.bottom + 24,
            width: '100%',
            maxWidth: 650,
            alignSelf: 'center',
            flexGrow: 1,
          }}
        >
          <Entrance
            active={focused}
            animationKey={animationKey}
            style={{ flexGrow: 1, gap: layout.gap }}
          >
            {children}
          </Entrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
export function Card({
  children,
  style,
  animationKey,
  delay,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  animationKey?: string | number;
  delay?: number;
}>) {
  const s = useResponsiveStyles();
  return (
    <Entrance animationKey={animationKey} delay={delay} style={[s.card, style]}>
      {children}
    </Entrance>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { compact } = useLayout();
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const press = (toValue: number) => {
    Animated.spring(scale, {
      toValue: reduced ? 1 : toValue,
      speed: 35,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };
  return (
    <Animated.View
      style={[style, { minWidth: 0, minHeight: 48, transform: [{ scale }] }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
        onPress={onPress}
        onPressIn={() => press(compact ? 0.985 : 0.97)}
        onPressOut={() => press(1)}
        disabled={disabled}
        style={({ pressed }) => [
          { opacity: disabled ? 0.35 : pressed ? 0.7 : 1, minHeight: 48 },
        ]}
      >
        <LinearGradient
          colors={
            secondary
              ? [colors.card, colors.button]
              : [colors.buttonHighlight, colors.button]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            minHeight: compact ? 48 : 52,
            justifyContent: 'center',
            paddingHorizontal: compact ? 10 : 17,
            paddingVertical: compact ? 13 : 15,
            borderRadius: 15,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              flexShrink: 1,
              fontWeight: '500',
              color: colors.text,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
export function Header({
  title,
  back,
  right,
}: {
  title: string;
  back?: () => void;
  right?: React.ReactNode;
}) {
  const s = useResponsiveStyles();
  const layout = useLayout();
  return (
    <View
      style={[
        s.between,
        { marginBottom: 4, flexWrap: layout.narrow ? 'wrap' : 'nowrap' },
      ]}
    >
      <View style={[s.row, { flex: 1 }]}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={back}
            style={[s.chip, { paddingVertical: 10 }]}
          >
            <Text style={s.text}>‹</Text>
          </Pressable>
        )}
        <Text style={back ? [s.text, { flex: 1 }] : [s.title, { flex: 1 }]}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}
export function Field(props: TextInputProps) {
  const s = useResponsiveStyles();
  const layout = useLayout();
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      selectionColor={colors.gold}
      {...props}
      style={[
        s.input,
        { padding: layout.compact ? 12 : 14, minWidth: 0 },
        props.style,
      ]}
    />
  );
}
export function Tag({ children }: PropsWithChildren) {
  const s = useResponsiveStyles();
  const layout = useLayout();
  return (
    <View
      style={[
        s.chip,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          alignSelf: 'flex-start',
          maxWidth: layout.narrow ? 105 : 150,
        },
      ]}
    >
      <Text style={s.label}>{children}</Text>
    </View>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <View
      style={{
        height: 4,
        borderRadius: 4,
        backgroundColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={[colors.gold, colors.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          height: 4,
          width: `${Math.min(100, Math.max(0, value * 100))}%`,
        }}
      />
    </View>
  );
}
export function StepProgress({
  current,
  total = 4,
}: {
  current: number;
  total?: number;
}) {
  const completed = Math.min(total, Math.max(0, current));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Step progress"
      accessibilityValue={{ min: 0, max: total, now: completed }}
      style={{ flexDirection: 'row', gap: 10 }}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 4,
            backgroundColor: colors.border,
            overflow: 'hidden',
          }}
        >
          {index < completed && (
            <LinearGradient
              colors={[colors.gold, colors.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 4, width: '100%' }}
            />
          )}
        </View>
      ))}
    </View>
  );
}
export function Empty({
  title,
  body,
  action,
  onPress,
}: {
  title: string;
  body: string;
  action?: string;
  onPress?: () => void;
}) {
  const s = useResponsiveStyles();
  const layout = useLayout();
  return (
    <Card
      style={{
        paddingVertical: layout.compact ? 24 : 38,
        alignItems: 'center',
        borderStyle: 'dashed',
        marginTop: 20,
      }}
    >
      <View style={[s.chip, { padding: 20, marginBottom: 4 }]}>
        <Icon name="search" color={colors.pale} />
      </View>
      <Text style={[s.heading, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[s.muted, { textAlign: 'center', maxWidth: 280 }]}>
        {body}
      </Text>
      {action && onPress && <Button title={action} onPress={onPress} />}
    </Card>
  );
}
export function Sheet({
  visible,
  onClose,
  title,
  children,
}: PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title: string;
}>) {
  const s = useResponsiveStyles();
  const layout = useLayout();
  const reduced = useReducedMotion();
  return (
    <Modal
      transparent
      visible={visible}
      animationType={reduced ? 'none' : 'slide'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: '#000b',
        }}
      >
        <Pressable
          onPress={onClose}
          accessibilityLabel="Close dialog"
          style={{ flex: 1 }}
        />
        <View
          style={{
            maxHeight: layout.compact ? '94%' : '85%',
            backgroundColor: colors.card,
            padding: layout.gutter,
            paddingBottom: Math.max(16, layout.insets.bottom),
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 16 }}
          >
            <Header
              title={title}
              right={
                <Pressable onPress={onClose} accessibilityLabel="Close">
                  <Text style={s.heading}>×</Text>
                </Pressable>
              }
            />
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
export function Icon({
  name,
  color = colors.muted,
  size = 23,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  const paths: Record<string, string> = {
    Learn: 'M3 5Q8 3 12 6Q16 3 21 5V20Q16 18 12 21Q8 18 3 20ZM12 6V21',
    Library: 'M4 4V20M8 4V20M13 4L16 20M18 4L21 20',
    Calculator:
      'M6 3H18Q20 3 20 5V20Q20 22 18 22H6Q4 22 4 20V5Q4 3 6 3M7 7H17M7 11H9M12 11H14M16 11H17M7 15H9M12 15H14M7 19H9M12 19H17',
    Simulation: 'M2 13H6L9 4L12 20L15 9L18 13H22',
    Reverse: 'M15 8L8 12L15 16ZM21 12A9 9 0 1 1 3 12A9 9 0 1 1 21 12',
    search: 'M16 16L22 22M18 10A8 8 0 1 1 2 10A8 8 0 1 1 18 10',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={paths[name] || paths.Simulation}
        stroke={color}
        strokeWidth={1.7}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export function Ring({ value, label }: { value: number; label: string }) {
  const s = useResponsiveStyles();
  const layout = useLayout();
  return (
    <View
      style={{
        width: layout.compact ? 96 : 120,
        height: layout.compact ? 96 : 120,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg
        width={layout.compact ? 96 : 120}
        height={layout.compact ? 96 : 120}
        viewBox="0 0 120 120"
        style={{ position: 'absolute' }}
      >
        <Circle
          cx={60}
          cy={60}
          r={51}
          stroke={colors.border}
          strokeWidth={7}
          fill="none"
        />
        <Circle
          cx={60}
          cy={60}
          r={51}
          stroke={colors.gold}
          strokeWidth={7}
          fill="none"
          strokeDasharray={`${320 * value} 320`}
          rotation={-90}
          origin="60,60"
        />
      </Svg>
      <Text style={[s.title, { color: colors.pale }]}>
        {Math.round(value * 100)}%
      </Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}
export function Wave({
  values,
  color = colors.gold,
}: {
  values: number[];
  color?: string;
}) {
  return (
    <Svg
      width="100%"
      height={75}
      viewBox="0 0 300 75"
      preserveAspectRatio="none"
    >
      {values.map((v, i) => (
        <Rect
          key={i}
          x={(i * 300) / values.length}
          y={37 - Math.max(1, v * 32)}
          width={Math.max(1, 300 / values.length - 2)}
          height={Math.max(2, v * 64)}
          rx={1.5}
          fill={color}
        />
      ))}
    </Svg>
  );
}

export function ActionRow({ children }: PropsWithChildren) {
  const { narrow, gap } = useLayout();
  return (
    <View
      style={{
        flexDirection: narrow ? 'column' : 'row',
        gap,
        alignItems: narrow ? 'stretch' : 'center',
      }}
    >
      {React.Children.map(children, child => {
        if (
          !narrow ||
          !React.isValidElement<{ style?: StyleProp<ViewStyle> }>(child)
        ) {
          return child;
        }
        return React.cloneElement(child, {
          style: [
            child.props.style,
            { flex: 0, flexBasis: 'auto', flexShrink: 0 },
          ],
        });
      })}
    </View>
  );
}
