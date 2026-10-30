import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { renderTabBar } from './TabBar';
import { colors } from '../theme';
import { Stack, Tabs } from './types';
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
  return (
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
  );
}
