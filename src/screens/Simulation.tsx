import { useLayout, useResponsiveStyles } from '../hooks/useLayout';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActionRow,
  Button,
  Card,
  Empty,
  Field,
  Header,
  Progress,
  Screen,
  Sheet,
  Tag,
} from '../components/UI';
import { colors, mono } from '../theme';
import { Props, Stack, Tabs } from '../navigation/types';
import { SimulationRun, uid, useAppState } from '../state/AppState';
import { histogram, Parameters, statistics, trial } from '../utils/simulation';
import { exportRun } from '../services/export';
const defaults: Parameters = {
  frequency: 120,
  amplitude: 0.82,
  phase: 45,
  variation: 12,
  noise: -46,
  repetitions: 240,
  samples: 2048,
};
export function SimulationScreen({
  route,
}: BottomTabScreenProps<Tabs, 'Simulation'>) {
  const s = useResponsiveStyles();
  const layout = useLayout();
  const navigation = useNavigation<NativeStackNavigationProp<Stack>>();
  const { state, update } = useAppState();
  const [p, setP] = useState(defaults);
  const [repetitions, setRepetitions] = useState('240');
  const [samples, setSamples] = useState('2048');
  const [run, setRun] = useState<SimulationRun | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [sheet, setSheet] = useState(false);
  const cancelled = useRef(false);
  const busy = useRef(false);
  useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );
  useEffect(() => {
    const saved = state.runs.find(r => r.id === route.params?.runId);
    if (saved) {
      setRun(saved);
      setP({ ...saved, repetitions: saved.values.length });
      setSamples(String(saved.samples));
      setRepetitions(String(saved.values.length));
    }
  }, [route.params?.runId, state.runs]);
  const start = async () => {
    if (busy.current) {
      return;
    }
    const reps = Number(repetitions),
      size = Number(samples);
    if (
      !Number.isInteger(reps) ||
      reps < 10 ||
      reps > 2000 ||
      !Number.isInteger(size) ||
      size < 512 ||
      size > 8192
    ) {
      Alert.alert(
        'Check parameters',
        'Use 10–2000 repetitions and 512–8192 samples.',
      );
      return;
    }
    busy.current = true;
    cancelled.current = false;
    setRun(null);
    setProgress(0);
    const values: number[] = [];
    const parameters = { ...p, repetitions: reps, samples: size };
    try {
      for (let i = 0; i < reps; i++) {
        if (cancelled.current) {
          return;
        }
        values.push(trial(parameters));
        if (i % 10 === 0) {
          setProgress((i + 1) / reps);
          await new Promise<void>(resolve => setTimeout(resolve, 0));
        }
      }
      setRun({
        id: uid(),
        date: new Date().toISOString(),
        ...parameters,
        values,
      });
    } finally {
      busy.current = false;
      if (!cancelled.current) {
        setProgress(null);
      }
    }
  };
  const stats = run ? statistics(run.values) : null;
  const knobs: [keyof Parameters, string, number, number, number, string][] = [
    ['frequency', 'Frequency', 20, 400, 1, 'Hz'],
    ['amplitude', 'Amplitude', 0.1, 1, 0.01, 'FS'],
    ['phase', 'Phase offset', 0, 360, 1, '°'],
    ['variation', 'Variation range', 0, 40, 1, '%'],
    ['noise', 'Noise floor', -80, -20, 1, 'dBFS'],
  ];
  const report = async (type: 'csv' | 'pdf' | 'copy') => {
    if (!run) {
      return;
    }
    try {
      await exportRun(run, type);
      setSheet(false);
      if (type === 'copy') {
        Alert.alert('Copied', 'Statistics copied to clipboard.');
      }
    } catch (error) {
      Alert.alert('Export failed', String(error));
    }
  };
  return (
    <Screen tab>
      <Header
        title="Simulation"
        right={
          <Pressable onPress={() => navigation.navigate('SavedRuns')}>
            <Text style={s.chipText}>My runs · {state.runs.length}</Text>
          </Pressable>
        }
      />
      <View style={s.between}>
        <Text style={s.muted}>Monte-Carlo signal lab</Text>
        <Tag>{progress !== null ? 'RUNNING' : run ? 'COMPLETE' : 'READY'}</Tag>
      </View>
      <Card>
        <Text style={s.text}>Parameters</Text>
        {knobs.map(([key, label, min, max, step, unit]) => (
          <View key={key} style={{ gap: 4 }}>
            <View style={s.between}>
              <Text style={s.muted}>{label}</Text>
              <Text style={[s.chipText, { fontFamily: mono }]}>
                {key === 'variation' ? '±' : ''}
                {p[key]} {unit}
              </Text>
            </View>
            <Slider
              accessibilityLabel={label}
              disabled={progress !== null}
              minimumValue={min}
              maximumValue={max}
              step={step}
              value={p[key]}
              minimumTrackTintColor={colors.teal}
              maximumTrackTintColor="#303738"
              thumbTintColor={colors.pale}
              onValueChange={v =>
                setP(old => ({ ...old, [key]: Number(v.toFixed(2)) }))
              }
            />
          </View>
        ))}
        <View style={s.row}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={s.label}>REPETITIONS</Text>
            <Field
              value={repetitions}
              onChangeText={setRepetitions}
              keyboardType="number-pad"
              editable={progress === null}
            />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={s.label}>SAMPLE SIZE</Text>
            <Field
              value={samples}
              onChangeText={setSamples}
              keyboardType="number-pad"
              editable={progress === null}
            />
          </View>
        </View>
      </Card>
      <ActionRow>
        <Button
          style={{ flex: 1 }}
          title={progress !== null ? 'Running trials…' : 'Run Simulation'}
          disabled={progress !== null}
          onPress={start}
        />
        <Button
          title={progress !== null ? 'Cancel' : 'Reset'}
          secondary
          onPress={() => {
            cancelled.current = true;
            setProgress(null);
            setRun(null);
            setP(defaults);
            setRepetitions('240');
            setSamples('2048');
          }}
        />
      </ActionRow>
      {progress !== null && (
        <Card>
          <Text style={s.label}>
            RUNNING MONTE-CARLO TRIALS · {Math.round(progress * 100)}%
          </Text>
          <Progress value={progress} />
          <Text style={s.muted}>
            Synthesizing signals · adding noise · estimating frequency
          </Text>
        </Card>
      )}
      {run && stats && (
        <>
          <View style={[s.row, { flexWrap: 'wrap' }]}>
            {[
              ['MEAN', stats.mean.toFixed(2) + ' Hz'],
              ['STD DEV', stats.deviation.toFixed(2) + ' Hz'],
              ['RANGE', stats.min.toFixed(1) + '–' + stats.max.toFixed(1)],
              ['WITHIN 1σ', stats.within.toFixed(0) + '%'],
            ].map(([label, value]) => (
              <Card
                key={label}
                style={{ width: layout.narrow ? '100%' : '48%', flexGrow: 1 }}
              >
                <Text style={s.label}>{label}</Text>
                <Text
                  style={[
                    s.heading,
                    { fontFamily: mono, color: colors.pale, fontSize: 18 },
                  ]}
                >
                  {value}
                </Text>
              </Card>
            ))}
          </View>
          <Card>
            <Text style={s.text}>Measured frequency per trial</Text>
            <Svg
              width="100%"
              height={155}
              viewBox="0 0 300 155"
              preserveAspectRatio="none"
            >
              <Line
                x1={0}
                x2={300}
                y1={77}
                y2={77}
                stroke="#54605a"
                strokeDasharray="4 4"
              />
              <Path
                d={run.values
                  .filter(
                    (_, i) =>
                      i % Math.max(1, Math.floor(run.values.length / 100)) ===
                      0,
                  )
                  .map(
                    (v, i, a) =>
                      `${i ? 'L' : 'M'}${(i / (a.length - 1)) * 300},${
                        140 -
                        ((v - stats.min) / (stats.max - stats.min || 1)) * 125
                      }`,
                  )
                  .join(' ')}
                fill="none"
                stroke={colors.teal}
                strokeWidth={1.6}
              />
            </Svg>
            <Text style={s.label}>TRIAL 1 TRIAL {run.values.length}</Text>
          </Card>
          <Card>
            <Text style={s.text}>Distribution of results</Text>
            <Svg
              width="100%"
              height={135}
              viewBox="0 0 300 135"
              preserveAspectRatio="none"
            >
              {histogram(run.values).map((v, i, a) => (
                <Rect
                  key={i}
                  x={i * 18.75}
                  y={130 - (v / Math.max(...a)) * 120}
                  width={15}
                  height={(v / Math.max(...a)) * 120}
                  fill={colors.pale}
                  rx={3}
                />
              ))}
            </Svg>
          </Card>
          <Card>
            <Text style={s.text}>Statistics</Text>
            {[
              ['Expected frequency', `${run.frequency} Hz`],
              ['Simulated mean', `${stats.mean.toFixed(3)} Hz`],
              [
                'Absolute error',
                `${Math.abs(stats.mean - run.frequency).toFixed(3)} Hz`,
              ],
              ['Variance', stats.variance.toFixed(3)],
              ['Repetitions', run.values.length],
              ['Noise floor', `${run.noise} dBFS`],
            ].map(([label, value]) => (
              <View key={label} style={s.between}>
                <Text style={s.muted}>{label}</Text>
                <Text style={s.chipText}>{value}</Text>
              </View>
            ))}
          </Card>
          <Button title="Save Result / Export" onPress={() => setSheet(true)} />
        </>
      )}
      <Sheet
        visible={sheet}
        title="Save simulation run"
        onClose={() => setSheet(false)}
      >
        <Button
          title="Save to my runs"
          onPress={() => {
            if (run) {
              update(v => ({
                ...v,
                runs: [run, ...v.runs.filter(r => r.id !== run.id)],
              }));
              setSheet(false);
            }
          }}
        />
        <Button
          secondary
          title="Export CSV of all trials"
          onPress={() => report('csv')}
        />
        <Button
          secondary
          title="Copy statistics summary"
          onPress={() => report('copy')}
        />
        <Button
          secondary
          title="Share PDF report"
          onPress={() => report('pdf')}
        />
      </Sheet>
    </Screen>
  );
}
export function SavedRunsScreen({ navigation }: Props<'SavedRuns'>) {
  const s = useResponsiveStyles();
  const { state, update } = useAppState();
  return (
    <Screen>
      <Header title="My simulation runs" back={navigation.goBack} />
      {!state.runs.length && (
        <Empty
          title="No saved runs"
          body="Run a simulation, then save its results to revisit them here."
        />
      )}
      {state.runs.map(run => (
        <Card key={run.id}>
          <Text style={s.label}>{new Date(run.date).toLocaleString()}</Text>
          <Text style={s.heading}>
            {run.values.length} trials ·{' '}
            {statistics(run.values).mean.toFixed(2)} Hz
          </Text>
          <Button
            secondary
            title="View run"
            onPress={() =>
              navigation.navigate('Main', {
                screen: 'Simulation',
                params: { runId: run.id },
              })
            }
          />
          <Pressable
            onPress={() =>
              Alert.alert('Delete this run?', 'This cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () =>
                    update(v => ({
                      ...v,
                      runs: v.runs.filter(r => r.id !== run.id),
                    })),
                },
              ])
            }
          >
            <Text style={{ color: colors.danger, textAlign: 'center' }}>
              Delete
            </Text>
          </Pressable>
        </Card>
      ))}
    </Screen>
  );
}
