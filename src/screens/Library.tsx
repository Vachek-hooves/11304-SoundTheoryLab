import { useResponsiveStyles } from '../hooks/useLayout';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import formulas from '../data/formulas.json';
import glossary from '../data/glossary.json';
import {
  Button,
  Card,
  Empty,
  Field,
  Header,
  Screen,
  Tag,
  Wave,
} from '../components/UI';
import { colors, mono } from '../theme';
import { Props, Stack } from '../navigation/types';
export function LibraryScreen() {
  const s = useResponsiveStyles();
  const [mode, setMode] = useState('Formulas');
  const [query, setQuery] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<Stack>>();
  const filter = (item: { title: string; category: string }) =>
    `${item.title} ${item.category}`
      .toLowerCase()
      .includes(query.toLowerCase().trim());
  const foundFormulas = formulas.filter(filter);
  const foundTerms = glossary.filter(filter);
  const count = mode === 'Formulas' ? foundFormulas.length : foundTerms.length;
  return (
    <Screen tab animationKey={mode}>
      <Header title="Library" />
      <View style={[s.row, s.card, { padding: 3, gap: 0 }]}>
        {['Formulas', 'Glossary'].map(name => (
          <Button
            key={name}
            style={{ flex: 1 }}
            title={name}
            secondary={name !== mode}
            onPress={() => setMode(name)}
          />
        ))}
      </View>
      <Field
        accessibilityLabel="Search library"
        value={query}
        onChangeText={setQuery}
        placeholder={
          mode === 'Formulas'
            ? 'Search formulas, e.g. wavelength'
            : 'Search terms'
        }
        clearButtonMode="while-editing"
      />
      <Text style={s.label}>
        {count} {mode === 'Formulas' ? 'FORMULAS' : 'TERMS'}
      </Text>
      {!count && (
        <Empty
          title={`No matches for “${query}”`}
          body="Try a shorter query, or browse the library instead."
          action="Clear search"
          onPress={() => setQuery('')}
        />
      )}
      {mode === 'Formulas'
        ? foundFormulas.map(f => (
            <Pressable
              key={f.id}
              onPress={() => navigation.navigate('Formula', { id: f.id })}
            >
              <Card>
                <View style={s.between}>
                  <Text style={[s.text, { flex: 1, fontSize: 16 }]}>
                    {f.title}
                  </Text>
                  <Tag>{f.category}</Tag>
                </View>
                <View
                  style={{
                    padding: 15,
                    borderRadius: 14,
                    backgroundColor: '#080b0b',
                    borderWidth: 1,
                    borderColor: '#3a3120',
                  }}
                >
                  <Text
                    style={{
                      color: colors.pale,
                      fontFamily: mono,
                      fontSize: 19,
                      textAlign: 'center',
                    }}
                  >
                    {f.equation}
                  </Text>
                </View>
                <Text style={s.muted}>{f.description}</Text>
                <View style={[s.row, { flexWrap: 'wrap', gap: 5 }]}>
                  {f.variables.slice(0, 4).map(v => (
                    <Text
                      key={v}
                      style={[
                        s.chip,
                        {
                          fontSize: 10,
                          color: colors.muted,
                          paddingVertical: 3,
                        },
                      ]}
                    >
                      {v}
                    </Text>
                  ))}
                </View>
              </Card>
            </Pressable>
          ))
        : foundTerms.map(t => (
            <Pressable
              key={t.id}
              onPress={() => navigation.navigate('Glossary', { id: t.id })}
            >
              <Card style={{ padding: 14 }}>
                <View style={s.row}>
                  <Text style={[s.chip, { color: colors.pale, padding: 14 }]}>
                    {t.title[0]}
                  </Text>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={s.text}>
                      {t.title} <Text style={s.label}> {t.category}</Text>
                    </Text>
                    <Text style={s.muted} numberOfLines={1}>
                      {t.body}
                    </Text>
                  </View>
                  <Text style={s.muted}>›</Text>
                </View>
              </Card>
            </Pressable>
          ))}
    </Screen>
  );
}
export function GlossaryScreen({ route, navigation }: Props<'Glossary'>) {
  const s = useResponsiveStyles();
  const term = glossary.find(t => t.id === route.params.id)!;
  const related = glossary
    .filter(t => t.id !== term.id && t.category === term.category)
    .slice(0, 5);
  return (
    <Screen>
      <Header title="Glossary" back={navigation.goBack} />
      <Text style={s.label}>{term.category}</Text>
      <Text style={s.title}>{term.title}</Text>
      <Text style={s.muted}>{term.pronunciation}</Text>
      <Card>
        <Wave
          values={Array.from(
            { length: 42 },
            (_, i) =>
              Math.abs(Math.sin(i * 1.8)) * Math.sin((Math.PI * i) / 42),
          )}
        />
      </Card>
      <Card>
        <Text style={[s.muted, { fontSize: 15, lineHeight: 26 }]}>
          {term.body}
        </Text>
      </Card>
      {related.length > 0 && (
        <Card>
          <Text style={s.text}>Related terms</Text>
          <View style={[s.row, { flexWrap: 'wrap' }]}>
            {related.map(t => (
              <Pressable
                key={t.id}
                style={s.chip}
                onPress={() => navigation.push('Glossary', { id: t.id })}
              >
                <Text style={s.chipText}>{t.title}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      )}
    </Screen>
  );
}
export function FormulaScreen({ route, navigation }: Props<'Formula'>) {
  const s = useResponsiveStyles();
  const f = formulas.find(item => item.id === route.params.id)!;
  return (
    <Screen>
      <Header title="Formula" back={navigation.goBack} />
      <Tag>{f.category}</Tag>
      <Text style={s.title}>{f.title}</Text>
      <Card>
        <Text style={[s.heading, { fontFamily: mono, color: colors.pale }]}>
          {f.equation}
        </Text>
      </Card>
      <Text style={s.text}>{f.description}</Text>
      <Card>
        {f.variables.map((v, i) => (
          <Text key={i} style={s.muted}>
            {v}
          </Text>
        ))}
      </Card>
      <Button
        title="Open in Calculator →"
        onPress={() =>
          navigation.navigate('Main', {
            screen: 'Calculator',
            params: { formulaId: f.id },
          })
        }
      />
    </Screen>
  );
}
