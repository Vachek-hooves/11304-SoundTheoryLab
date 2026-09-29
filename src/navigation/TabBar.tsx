import React from 'react';
import { Pressable, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '../hooks/useLayout';
import { Icon } from '../components/UI';
import { colors } from '../theme';
function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  return (
    <View
      style={{
        position: 'absolute',
        bottom: Math.max(12, insets.bottom + 7),
        left: Math.max(layout.gutter, (layout.width - 600) / 2),
        right: Math.max(layout.gutter, (layout.width - 600) / 2),
        maxWidth: 600,
        alignSelf: 'center',
        borderRadius: 27,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        padding: 7,
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={route.name}
            accessibilityState={{ selected: focused }}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={{
              height: layout.compact ? 44 : 49,
              flex: 1,
              maxWidth: 63,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? colors.button : 'transparent',
              gap: 4,
            }}
          >
            <Icon
              name={route.name}
              color={focused ? colors.pale : colors.muted}
            />
            {focused && (
              <View
                style={{
                  height: 3,
                  width: 3,
                  borderRadius: 2,
                  backgroundColor: colors.teal,
                }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
export function renderTabBar(props: BottomTabBarProps) {
  return <TabBar {...props} />;
}
