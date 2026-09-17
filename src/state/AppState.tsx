import React, {
  createContext,
  useCallback,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
export type SavedResult = {
  id: string;
  kind: string;
  input: string;
  result: string;
  label: string;
  tags: string[];
  date: string;
};
export type SimulationRun = {
  id: string;
  date: string;
  values: number[];
  frequency: number;
  amplitude: number;
  phase: number;
  variation: number;
  noise: number;
  samples: number;
};
export type QuizSession = { ids: string[]; answers: number[]; elapsed: number };
type State = {
  onboarded: boolean;
  completed: string[];
  bookmarks: string[];
  results: SavedResult[];
  runs: SimulationRun[];
  quiz: QuizSession | null;
  history: { id: string; date: string; score: number; elapsed: number }[];
};
const initial: State = {
  onboarded: false,
  completed: [],
  bookmarks: [],
  results: [],
  runs: [],
  quiz: null,
  history: [],
};
const Context = createContext<{
  state: State;
  ready: boolean;
  update: (fn: (value: State) => State) => void;
}>({ state: initial, ready: false, update: () => {} });
export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  const writes = useRef(Promise.resolve());
  const current = useRef(initial);
  useEffect(() => {
    AsyncStorage.getItem('bass-toolkit-v1')
      .then(raw => {
        if (raw) {
          const data = JSON.parse(raw);
          const restored = { ...initial, ...data };
          if (
            ![
              restored.completed,
              restored.bookmarks,
              restored.results,
              restored.runs,
              restored.history,
            ].every(Array.isArray)
          ) {
            throw new Error('Invalid saved data');
          }
          current.current = restored;
          setState(restored);
        }
      })
      .catch(() =>
        Alert.alert(
          'Storage unavailable',
          'Your saved data could not be loaded. Please restart the app.',
        ),
      )
      .finally(() => setReady(true));
  }, []);
  const update = useCallback((fn: (value: State) => State) => {
    const next = fn(current.current);
    current.current = next;
    setState(next);
    writes.current = writes.current
      .then(() => AsyncStorage.setItem('bass-toolkit-v1', JSON.stringify(next)))
      .catch(() =>
        Alert.alert(
          'Unable to save',
          'Your device could not save this change. Please check available storage.',
        ),
      );
  }, []);
  return (
    <Context.Provider value={{ state, ready, update }}>
      {children}
    </Context.Provider>
  );
}
export const useAppState = () => useContext(Context);
export const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
