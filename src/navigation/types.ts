import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
export type Tabs = {
  Learn: undefined;
  Library: undefined;
  Calculator: { formulaId?: string } | undefined;
  Simulation: { runId?: string } | undefined;
  Reverse: undefined;
};
export type Stack = {
  Main: NavigatorScreenParams<Tabs> | undefined;
  Module: { id: string };
  Lesson: { id: string };
  Glossary: { id: string };
  Formula: { id: string };
  Quiz: undefined;
  QuizResult: { score: number; elapsed: number; previousBest: number };
  SavedResults: undefined;
  SavedRuns: undefined;
};
export type Props<T extends keyof Stack> = NativeStackScreenProps<Stack, T>;
