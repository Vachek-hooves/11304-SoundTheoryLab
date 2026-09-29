import { useResponsiveStyles } from '../hooks/useLayout';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Pressable, Text, View } from 'react-native';
import questions from '../data/questions.json';
import { Button, Card, Header, Progress, Ring, Screen } from '../components/UI';
import { colors } from '../theme';
import { QuizSession, uid, useAppState } from '../state/AppState';
import { Props } from '../navigation/types';
function newQuiz(): QuizSession {
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { ids: pool.slice(0, 5).map(q => q.id), answers: [], elapsed: 0 };
}
export function QuizScreen({ navigation }: Props<'Quiz'>) {
  const s = useResponsiveStyles();
  const { state, update } = useAppState();
  const [session, setSession] = useState<QuizSession>(
    () => state.quiz || newQuiz(),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [paused, setPaused] = useState(false);
  const current = useRef(session);
  const finished = useRef(false);
  current.current = session;
  useEffect(() => {
    if (paused) {
      return;
    }
    const timer = setInterval(
      () => setSession(v => ({ ...v, elapsed: v.elapsed + 1 })),
      1000,
    );
    return () => clearInterval(timer);
  }, [paused]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', value => {
      setPaused(value !== 'active');
      if (value !== 'active') {
        update(v => ({ ...v, quiz: current.current }));
      }
    });
    return () => {
      sub.remove();
      if (!finished.current) {
        update(v => ({ ...v, quiz: current.current }));
      }
    };
  }, [update]);
  const q = questions.find(
    item => item.id === session.ids[session.answers.length],
  )!;
  const pause = () => {
    setPaused(true);
    Alert.alert(
      'Pause the quiz?',
      'Your answers and time will be kept. Resume from the Learn tab.',
      [
        { text: 'Keep going', onPress: () => setPaused(false) },
        { text: 'Pause & exit', onPress: () => navigation.goBack() },
      ],
      { cancelable: false },
    );
  };
  const next = () => {
    if (selected === null) {
      return;
    }
    if (!revealed) {
      setRevealed(true);
      return;
    }
    const answers = [...session.answers, selected];
    if (answers.length === 5) {
      finished.current = true;
      const score = answers.reduce(
        (sum, answer, i) =>
          sum +
          Number(
            questions.find(item => item.id === session.ids[i])!.answer ===
              answer,
          ),
        0,
      );
      const previousBest = Math.max(0, ...state.history.map(h => h.score));
      update(v => ({
        ...v,
        quiz: null,
        history: [
          ...v.history,
          {
            id: uid(),
            date: new Date().toISOString(),
            score,
            elapsed: session.elapsed,
          },
        ],
      }));
      navigation.replace('QuizResult', {
        score,
        elapsed: session.elapsed,
        previousBest,
      });
    } else {
      const value = { ...session, answers };
      setSession(value);
      update(v => ({ ...v, quiz: value }));
      setSelected(null);
      setRevealed(false);
    }
  };
  return (
    <Screen animationKey={q.id}>
      <Header
        title="Daily Quiz"
        back={pause}
        right={
          <Pressable style={s.chip} onPress={pause}>
            <Text style={s.muted}>Pause</Text>
          </Pressable>
        }
      />
      <View style={s.between}>
        <Text style={s.label}>QUESTION {session.answers.length + 1} OF 5</Text>
        <Text style={s.label}>
          {Math.floor(session.elapsed / 60)
            .toString()
            .padStart(2, '0')}
          :{(session.elapsed % 60).toString().padStart(2, '0')}
        </Text>
      </View>
      <Progress value={(session.answers.length + 1) / 5} />
      <Card>
        <Text style={s.label}>SOUND & LOW-END PHYSICS</Text>
        <Text style={[s.heading, { fontSize: 19, lineHeight: 28 }]}>
          {q.question}
        </Text>
      </Card>
      {q.options.map((option, i) => {
        const correct = revealed && i === q.answer;
        const wrong = revealed && i === selected && !correct;
        return (
          <Pressable key={i} disabled={revealed} onPress={() => setSelected(i)}>
            <Card
              style={{
                borderColor: correct
                  ? '#126259'
                  : wrong
                  ? '#623224'
                  : i === selected
                  ? colors.gold
                  : colors.border,
                backgroundColor: correct
                  ? '#06201c'
                  : wrong
                  ? '#27130d'
                  : colors.card,
              }}
            >
              <View style={s.row}>
                <Text style={[s.chip, { color: colors.muted }]}>
                  {'ABCD'[i]}
                </Text>
                <Text style={[s.text, { flex: 1 }]}>{option}</Text>
                {correct && <Text style={{ color: colors.teal }}>✓</Text>}
                {wrong && <Text style={{ color: colors.danger }}>×</Text>}
              </View>
            </Card>
          </Pressable>
        );
      })}
      <View style={{ flex: 1, minHeight: 20 }} />
      {revealed && (
        <Card>
          <Text style={[s.text, { color: colors.teal }]}>
            Correct answer: {q.options[q.answer]}
          </Text>
        </Card>
      )}
      <Button
        disabled={selected === null}
        title={
          selected === null
            ? 'Select an answer'
            : !revealed
            ? 'Check answer'
            : session.answers.length === 4
            ? 'Submit Quiz'
            : 'Next question →'
        }
        onPress={next}
      />
    </Screen>
  );
}
export function QuizResultScreen({ route, navigation }: Props<'QuizResult'>) {
  const s = useResponsiveStyles();
  const { score, elapsed, previousBest } = route.params;
  const { update } = useAppState();
  return (
    <Screen>
      <View style={{ height: 25 }} />
      <Card
        style={{
          alignItems: 'center',
          paddingVertical: 26,
          borderColor: colors.border,
        }}
      >
        <Ring value={score / 5} label="SCORE" />
        <Text style={s.heading}>
          {score >= 4
            ? 'Sharp low-end instincts'
            : score >= 2
            ? 'Your understanding is growing'
            : 'Every question is a new start'}
        </Text>
        <Text style={[s.muted, { textAlign: 'center' }]}>
          Keep exploring the lessons and put your knowledge into practice.
        </Text>
      </Card>
      <View style={s.row}>
        <Card style={{ flex: 1 }}>
          <Text style={[s.heading, { color: colors.teal }]}>{score}</Text>
          <Text style={s.label}>CORRECT</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={[s.heading, { color: colors.danger }]}>{5 - score}</Text>
          <Text style={s.label}>INCORRECT</Text>
        </Card>
      </View>
      <Card>
        <Text style={s.text}>Compared with your best</Text>
        <Text style={s.muted}>Previous best: {previousBest * 20}%</Text>
        <Progress value={previousBest / 5} />
        <Text style={s.muted}>
          Now: {score * 20}% · Average answer: {(elapsed / 5).toFixed(1)} s
        </Text>
        <Progress value={score / 5} />
      </Card>
      <Button
        title="Retry Quiz"
        onPress={() => {
          update(v => ({ ...v, quiz: null }));
          navigation.replace('Quiz');
        }}
      />
      <Button
        secondary
        title="Back to Learn"
        onPress={() => navigation.goBack()}
      />
    </Screen>
  );
}
