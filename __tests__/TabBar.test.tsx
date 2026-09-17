import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { renderTabBar } from '../src/navigation/TabBar';

jest.mock('../src/components/UI', () => ({ Icon: () => null }));

test('tab-bar render callback creates a component without invoking its hooks', async () => {
  const navigate = jest.fn();
  const emit = jest.fn(() => ({ defaultPrevented: false }));
  const props = {
    state: {
      index: 0,
      routes: ['Learn', 'Library', 'Calculator', 'Simulation', 'Reverse'].map(
        name => ({ key: name, name }),
      ),
    },
    navigation: { navigate, emit },
    descriptors: {},
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  } as unknown as BottomTabBarProps;
  const element = renderTabBar(props);
  expect(React.isValidElement(element)).toBe(true);
  let renderer: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <SafeAreaInsetsContext.Provider value={props.insets}>
        {element}
      </SafeAreaInsetsContext.Provider>,
    );
  });
  const tabs = renderer!.root.findAll(
    node =>
      node.props.accessibilityRole === 'tab' &&
      typeof node.props.onPress === 'function',
  );
  expect(tabs).toHaveLength(5);
  expect(tabs[0].props.accessibilityState.selected).toBe(true);
  await act(async () => {
    tabs[1].props.onPress();
  });
  expect(navigate).toHaveBeenCalledWith('Library');
  emit.mockReturnValueOnce({ defaultPrevented: true });
  await act(async () => {
    tabs[2].props.onPress();
  });
  expect(navigate).toHaveBeenCalledTimes(1);
  await act(async () => {
    renderer!.unmount();
  });
});
