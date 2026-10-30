import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { AppStateProvider, useAppState } from '../state/AppState';
import { colors } from '../theme';
import { Loader, Onboarding } from '../screens/Welcome';
import { AppNavigator } from './AppNavigator';

function RootNavigatorInner() {
  const [loaded, setLoaded] = useState(false);
  const { state, ready } = useAppState();
  if (!loaded) {
    return <Loader onDone={() => setLoaded(true)} />;
  }
  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.pale }}>Opening Sound Theory Lab…</Text>
      </View>
    );
  }
  if (!state.onboarded) {
    return <Onboarding />;
  }
  return <AppNavigator />;
}

export default function RootNavigator() {
  return (
    <AppStateProvider>
      <RootNavigatorInner />
    </AppStateProvider>
  );
}
