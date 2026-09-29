import { useResponsiveStyles } from '../hooks/useLayout';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import modules from '../data/modules.json';
import {
  Button,
  Card,
  Header,
  Icon,
  Progress,
  Screen,
  Tag,
} from '../components/UI';
import { colors } from '../theme';
import { useAppState } from '../state/AppState';
import { Props, Stack } from '../navigation/types';
export function LearnScreen() {
  const s = useResponsiveStyles();
  const navigation = useNavigation<NativeStackNavigationProp<Stack>>();
  const { state } = useAppState();
  const count = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const localDay = (value: Date) =>
    `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
  const days = new Set(state.history.map(h => localDay(new Date(h.date))));
  let streak = 0;
  const day = new Date();
  if (!days.has(localDay(day))) {
    day.setDate(day.getDate() - 1);
  }
  while (days.has(localDay(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return (
    <Screen tab>
      <View style={s.between}>
        <View>
          <Text style={s.muted}>
            {new Date().getHours() < 12
              ? 'Good morning'
              : new Date().getHours() < 18
              ? 'Good afternoon'
              : 'Good evening'}
          </Text>
          <Text style={s.title}>Learn</Text>
        </View>
        <Tag>STREAK {streak}</Tag>
      </View>
      <Card
        style={{
          backgroundColor: colors.surfaceHighlight,
          borderColor: colors.border,
        }}
      >
        <Text style={s.label}>
          ● DAILY QUIZ · {state.quiz ? 'PAUSED' : 'READY'}
        </Text>
        <Text style={s.heading}>Five questions on low-end physics</Text>
        <Text style={s.muted}>
          {state.history.length
            ? `Last score: ${
                state.history[state.history.length - 1].score
              } of 5. Keep exploring sound.`
            : 'Build your understanding, one question at a time.'}
        </Text>
        <Button
          title={state.quiz ? 'Resume Daily Quiz' : 'Start Daily Quiz'}
          onPress={() => navigation.navigate('Quiz')}
        />
      </Card>
      <View style={s.row}>
        <Card style={{ flex: 1 }}>
          <Text style={[s.heading, { color: colors.pale }]}>{count}</Text>
          <Text style={s.label}>LESSONS</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={[s.heading, { color: colors.teal }]}>
            {Math.round((state.completed.length / count) * 100)}%
          </Text>
          <Text style={s.label}>COMPLETE</Text>
        </Card>
      </View>
      <Text style={s.text}>Modules</Text>
      {modules.map((m, i) => {
        const completed = m.lessons.filter(l =>
          state.completed.includes(l.id),
        ).length;
        return (
          <Pressable
            key={m.id}
            onPress={() => navigation.navigate('Module', { id: m.id })}
          >
            <Card>
              <View style={[s.row, { alignItems: 'flex-start' }]}>
                <View style={[s.chip, { padding: 12 }]}>
                  <Icon
                    name={i % 2 ? 'Simulation' : 'Learn'}
                    color={i % 2 ? colors.teal : colors.pale}
                  />
                </View>
                <View style={{ flex: 1, gap: 7 }}>
                  <Text style={s.label}>{m.lessons.length} LESSONS</Text>
                  <Text style={[s.text, { fontSize: 16 }]}>{m.title}</Text>
                  <Text style={s.muted} numberOfLines={2}>
                    {m.description}
                  </Text>
                  <Progress value={completed / m.lessons.length} />
                  <Text style={[s.label, { color: colors.muted }]}>
                    {completed} OF {m.lessons.length} COMPLETE
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}
export function ModuleScreen({ route, navigation }: Props<'Module'>) {
  const s = useResponsiveStyles();
  const module = modules.find(m => m.id === route.params.id)!;
  const { state, update } = useAppState();
  const done = module.lessons.filter(l =>
    state.completed.includes(l.id),
  ).length;
  const next =
    module.lessons.find(l => !state.completed.includes(l.id)) ||
    module.lessons[0];
  return (
    <Screen>
      <Header
        title="Module"
        back={navigation.goBack}
        right={
          <Pressable
            accessibilityLabel="Bookmark module"
            onPress={() =>
              update(v => ({
                ...v,
                bookmarks: v.bookmarks.includes(module.id)
                  ? v.bookmarks.filter(id => id !== module.id)
                  : [...v.bookmarks, module.id],
              }))
            }
          >
            <Text style={{ color: colors.gold, fontSize: 25 }}>
              {state.bookmarks.includes(module.id) ? '★' : '☆'}
            </Text>
          </Pressable>
        }
      />
      <Card style={{ borderColor: colors.border }}>
        <Text style={s.label}>{module.lessons.length} LESSONS</Text>
        <Text style={s.heading}>{module.title}</Text>
        <Progress value={done / module.lessons.length} />
        <Text style={s.muted}>
          {module.level} · {done} completed
        </Text>
        <Button
          title={done ? 'Continue learning' : 'Start module'}
          onPress={() => navigation.navigate('Lesson', { id: next.id })}
        />
      </Card>
      <Text style={s.text}>Lessons</Text>
      {module.lessons.map((l, i) => (
        <Pressable
          key={l.id}
          onPress={() => navigation.navigate('Lesson', { id: l.id })}
        >
          <Card>
            <View style={s.row}>
              <Text
                style={[
                  s.chipText,
                  {
                    padding: 8,
                    color: state.completed.includes(l.id)
                      ? colors.teal
                      : colors.muted,
                  },
                ]}
              >
                {state.completed.includes(l.id)
                  ? '✓'
                  : String(i + 1).padStart(2, '0')}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={s.text}>{l.title}</Text>
                <Text style={s.muted}>
                  {l.duration}
                  {state.completed.includes(l.id) ? ' · Completed' : ''}
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
export function LessonScreen({ route, navigation }: Props<'Lesson'>) {
  const s = useResponsiveStyles();
  const module = modules.find(m =>
    m.lessons.some(l => l.id === route.params.id),
  )!;
  const index = module.lessons.findIndex(l => l.id === route.params.id);
  const lesson = module.lessons[index];
  const { state, update } = useAppState();
  const paragraphs = lesson.body.split('\n');
  const takeaway = paragraphs.indexOf('Take away');
  return (
    <Screen key={lesson.id}>
      <Header
        title={module.title}
        back={navigation.goBack}
        right={
          <Text style={s.label}>
            {index + 1} / {module.lessons.length}
          </Text>
        }
      />
      <Text style={s.label}>{lesson.category}</Text>
      <Text style={s.title}>{lesson.title}</Text>
      <Text style={s.muted}>{lesson.duration}</Text>
      {paragraphs.slice(0, takeaway < 0 ? undefined : takeaway).map((line, i) =>
        /^(Formula|Where:|Example|Practical example|Key relationship)$/.test(
          line,
        ) ? (
          <Text key={i} style={[s.heading, { marginTop: 8 }]}>
            {line}
          </Text>
        ) : (
          <Text
            key={i}
            style={
              line.includes(' = ') || line.includes(' ≈ ')
                ? [
                    s.text,
                    {
                      color: colors.pale,
                      padding: 12,
                      backgroundColor: colors.input,
                      borderRadius: 10,
                    },
                  ]
                : [s.text, { color: '#bebdb4', lineHeight: 25 }]
            }
          >
            {line}
          </Text>
        ),
      )}
      {takeaway >= 0 && (
        <Card>
          <Text style={s.heading}>Take away</Text>
          {paragraphs.slice(takeaway + 1).map((line, i) => (
            <Text key={i} style={s.muted}>
              <Text style={{ color: colors.teal }}>• </Text>
              {line.trim()}
            </Text>
          ))}
        </Card>
      )}
      <Button
        title={
          state.completed.includes(lesson.id)
            ? 'Completed ✓'
            : 'Mark as complete'
        }
        onPress={() =>
          update(v => ({
            ...v,
            completed: Array.from(new Set([...v.completed, lesson.id])),
          }))
        }
      />
      {module.lessons[index + 1] && (
        <Button
          secondary
          title="Next lesson →"
          onPress={() =>
            navigation.replace('Lesson', { id: module.lessons[index + 1].id })
          }
        />
      )}
    </Screen>
  );
}
