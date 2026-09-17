import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from './src/state/AppState';
import { AppNavigator } from './src/navigation/AppNavigator';
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#070b0b" />
      <AppStateProvider>
        <AppNavigator />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
