import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { renderTabBar } from './TabBar';
import { colors } from '../theme';
import { useAppState } from '../state/AppState';
import { Stack, Tabs } from './types';
import { Loader, Onboarding } from '../screens/Welcome';
import { LearnScreen, LessonScreen, ModuleScreen } from '../screens/Learn';
import {
  FormulaScreen,
  GlossaryScreen,
  LibraryScreen,
} from '../screens/Library';
import { QuizResultScreen, QuizScreen } from '../screens/Quiz';
import { CalculatorScreen, SavedResultsScreen } from '../screens/Calculator';
import { SavedRunsScreen, SimulationScreen } from '../screens/Simulation';
import { ReverseScreen } from '../screens/Reverse';
const Root = createNativeStackNavigator<Stack>();
const Tab = createBottomTabNavigator<Tabs>();
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="Simulation" component={SimulationScreen} />
      <Tab.Screen name="Reverse" component={ReverseScreen} />
    </Tab.Navigator>
  );
}
export function AppNavigator() {
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
        <Text style={{ color: colors.pale }}>Opening your toolkit…</Text>
      </View>
    );
  }
  if (!state.onboarded) {
    return <Onboarding />;
  }
  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.bg,
          card: colors.card,
          text: colors.text,
          primary: colors.gold,
        },
      }}
    >
      <Root.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Root.Screen name="Main" component={MainTabs} />
        <Root.Screen name="Module" component={ModuleScreen} />
        <Root.Screen name="Lesson" component={LessonScreen} />
        <Root.Screen name="Glossary" component={GlossaryScreen} />
        <Root.Screen name="Formula" component={FormulaScreen} />
        <Root.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ gestureEnabled: false }}
        />
        <Root.Screen name="QuizResult" component={QuizResultScreen} />
        <Root.Screen name="SavedResults" component={SavedResultsScreen} />
        <Root.Screen name="SavedRuns" component={SavedRunsScreen} />
      </Root.Navigator>
    </NavigationContainer>
  );
}
