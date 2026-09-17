import { useLayout, useResponsiveStyles } from '../hooks/useLayout';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import formulas from '../data/formulas.json';
import {
  ActionRow,
  Button,
  Card,
  Empty,
  Field,
  Header,
  Screen,
  Sheet,
} from '../components/UI';
import { colors, mono } from '../theme';
import { Props, Stack, Tabs } from '../navigation/types';
import { uid, useAppState } from '../state/AppState';
import { calculate, calculations, format } from '../utils/calculations';
export function CalculatorScreen({
  route,
}: BottomTabScreenProps<Tabs, 'Calculator'>) {
  const s = useResponsiveStyles();
  const layout = useLayout();
  const navigation = useNavigation<NativeStackNavigationProp<Stack>>();
  const [id, setId] = useState('2');
  const [inputs, setInputs] = useState<string[]>(['']);
  const [save, setSave] = useState(false);
  const [pick, setPick] = useState(false);
  const [query, setQuery] = useState('');
  const [label, setLabel] = useState('');
  const [tags, setTags] = useState('');
  const { state, update } = useAppState();
  const select = (value: string) => {
    setId(value);
    setInputs(calculations[value].fields.map(() => ''));
    setPick(false);
  };
  useEffect(() => {
    if (route.params?.formulaId) {
      select(route.params.formulaId);
    }
  }, [route.params?.formulaId]);
  const def = calculations[id];
  const formula = formulas.find(f => f.id === id)!;
  const result = calculate(id, inputs);
  const display =
    result.value === undefined
      ? ''
      : `${format(id === '2' ? result.value * 1000 : result.value)} ${
          id === '2' ? 'ms' : def.unit
        }`;
  const inputText = inputs.map((v, i) => `${def.fields[i]}: ${v}`).join(' · ');
  return (
    <Screen tab>
      <Header
        title="Calculator"
        right={
          <Pressable
            style={s.chip}
            onPress={() => navigation.navigate('SavedResults')}
          >
            <Text style={s.chipText}>Saved · {state.results.length}</Text>
          </Pressable>
        }
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ gap: 8, alignItems: 'center' }}
      >
        {[
          ['2', 'Freq ↔ Period'],
          ['4', 'Freq ↔ Wavelength'],
          ['39', 'dB ↔ Ratio'],
          ['24', 'BPM ↔ Delay'],
        ].map(([key, title]) => (
          <Pressable
            style={[
              s.chip,
              {
                borderColor: id === key ? colors.gold : colors.border,
                paddingHorizontal: 13,
                paddingVertical: 10,
                minHeight: 44,
                justifyContent: 'center',
                alignSelf: 'center',
              },
            ]}
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: id === key }}
            onPress={() => select(key)}
          >
            <Text
              numberOfLines={1}
              style={[
                s.chipText,
                {
                  fontSize: 12,
                  lineHeight: 18,
                  color: id === key ? colors.pale : colors.muted,
                },
              ]}
            >
              {title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={() => setPick(true)} style={s.between}>
        <Text style={s.text}>{formula.title}</Text>
        <Text style={s.chipText}>All 86 formulas ›</Text>
      </Pressable>
      <Card animationKey={id}>
        <Text style={[s.label, { textAlign: 'right' }]}>
          {formula.equation}
        </Text>
        {def.fields.map((field, i) => (
          <View key={`${id}-${field}`} style={{ gap: 8 }}>
            <Text style={[s.label, { color: colors.muted }]}>{field}</Text>
            <Field
              accessibilityLabel={field}
              value={inputs[i] || ''}
              placeholder="Enter value"
              keyboardType={def.lists || def.signed ? 'default' : 'decimal-pad'}
              onChangeText={value =>
                setInputs(v => v.map((x, n) => (n === i ? value : x)))
              }
              style={{
                fontSize: def.fields.length === 1 ? 31 : 22,
                fontFamily: mono,
              }}
            />
          </View>
        ))}
      </Card>
      {result.error && (
        <Text style={{ color: colors.danger }}>{result.error}</Text>
      )}
      {result.value !== undefined ? (
        <Card style={{ borderColor: '#14534b', backgroundColor: '#0c2221' }}>
          <Text style={s.label}>RESULT</Text>
          <Text
            selectable
            style={{
              fontSize: layout.compact ? 27 : 34,
              color: colors.teal,
              fontFamily: mono,
            }}
          >
            {display}
          </Text>
          {id === '2' && (
            <>
              <Text style={s.muted}>Period (s) {format(result.value)}</Text>
              <Text style={s.muted}>
                Half cycle {format(result.value * 500)} ms
              </Text>
              <Text style={s.muted}>
                Angular ω {format(2 * Math.PI * Number(inputs[0]))} rad/s
              </Text>
            </>
          )}
        </Card>
      ) : (
        <Text style={s.muted}>Enter your values to calculate a result.</Text>
      )}
      <ActionRow>
        <Button
          style={{ flex: 1 }}
          title="Save"
          disabled={!display}
          onPress={() => setSave(true)}
        />
        <Button
          style={{ flex: 1 }}
          title="Copy"
          secondary
          disabled={!display}
          onPress={() => {
            Clipboard.setString(`${formula.title}\n${inputText}\n${display}`);
            Alert.alert('Copied', 'Result copied to clipboard.');
          }}
        />
        <Button
          title="↺"
          secondary
          onPress={() => setInputs(def.fields.map(() => ''))}
        />
      </ActionRow>
      <Text style={s.muted}>{formula.description}</Text>
      <Sheet visible={save} title="Save result" onClose={() => setSave(false)}>
        <Card>
          <Text style={s.label}>{formula.title}</Text>
          <Text style={[s.heading, { color: colors.pale }]}>{display}</Text>
        </Card>
        <Text style={s.label}>LABEL</Text>
        <Field
          placeholder="Add an optional label"
          value={label}
          onChangeText={setLabel}
        />
        <Field
          placeholder="Tags, separated by commas"
          value={tags}
          onChangeText={setTags}
        />
        <Button
          title="Save to library"
          onPress={() => {
            update(v => ({
              ...v,
              results: [
                {
                  id: uid(),
                  kind: formula.title,
                  input: inputText,
                  result: display,
                  label: label.trim(),
                  tags: tags
                    .split(',')
                    .map(t => t.trim())
                    .filter(Boolean),
                  date: new Date().toISOString(),
                },
                ...v.results,
              ],
            }));
            setSave(false);
            setLabel('');
            setTags('');
          }}
        />
      </Sheet>
      <Sheet
        visible={pick}
        title="Choose a formula"
        onClose={() => setPick(false)}
      >
        <Field
          value={query}
          onChangeText={setQuery}
          placeholder="Search formulas"
        />
        {formulas
          .filter(f => f.title.toLowerCase().includes(query.toLowerCase()))
          .map(f => (
            <Pressable
              key={f.id}
              onPress={() => select(f.id)}
              style={{ paddingVertical: 10 }}
            >
              <Text style={s.text}>{f.title}</Text>
              <Text style={s.label}>{f.equation}</Text>
            </Pressable>
          ))}
      </Sheet>
    </Screen>
  );
}
export function SavedResultsScreen({ navigation }: Props<'SavedResults'>) {
  const s = useResponsiveStyles();
  const { state, update } = useAppState();
  return (
    <Screen>
      <Header
        title="Saved Results"
        back={navigation.goBack}
        right={<Text style={s.label}>{state.results.length} ITEMS</Text>}
      />
      {!state.results.length ? (
        <Empty
          title="Nothing saved yet"
          body="Run any conversion in the calculator and tap Save — results land here with their inputs and timestamp."
          action="Open Calculator"
          onPress={() => navigation.navigate('Main', { screen: 'Calculator' })}
        />
      ) : (
        state.results.map(result => (
          <Card key={result.id}>
            <View style={s.between}>
              <Text style={[s.label, { flex: 1 }]}>{result.kind}</Text>
              <Pressable
                accessibilityLabel="Delete saved result"
                onPress={() =>
                  Alert.alert(
                    'Delete saved result?',
                    `${result.kind}\nThis cannot be undone.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () =>
                          update(v => ({
                            ...v,
                            results: v.results.filter(r => r.id !== result.id),
                          })),
                      },
                    ],
                  )
                }
              >
                <Text style={{ color: colors.danger, fontSize: 22 }}>⌫</Text>
              </Pressable>
            </View>
            <Text style={s.muted}>{result.input}</Text>
            <Text
              selectable
              style={[s.heading, { color: colors.pale, fontFamily: mono }]}
            >
              {result.result}
            </Text>
            {!!result.label && <Text style={s.text}>{result.label}</Text>}
            <Text style={s.muted}>
              {new Date(result.date).toLocaleString()}
            </Text>
            {!!result.tags.length && (
              <Text style={s.chipText}>{result.tags.join(' · ')}</Text>
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}
