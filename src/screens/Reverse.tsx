import { useLayout, useResponsiveStyles } from '../hooks/useLayout';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Pressable, Text, View } from 'react-native';
import { GradientSurface as LinearGradient } from '../components/GradientSurface';
import { useIsFocused } from '@react-navigation/native';
import {
  ActionRow,
  Button,
  Card,
  Header,
  StepProgress,
  Ring,
  Screen,
  Wave,
} from '../components/UI';
import { colors, mono } from '../theme';
import { audio, Recording } from '../services/audio';
import { similarity } from '../utils/wav';
const titles = [
  'Record your original sound',
  'Listen to it reversed',
  'Record the reversed version',
  'Reverse your attempt',
  'Original vs. your reversal',
];
const bodies = [
  'Say a short word or phrase clearly — two seconds is plenty. This becomes the reference for the whole round.',
  'We flipped your recording end to end. Listen until you can imitate the shape of the sound.',
  'Imitate what you just heard. The reference waveform stays above so you can match its timing.',
  'Flipping your imitation should reveal something close to the original word. Ready to hear it?',
  'Both takes are lined up below. Play them back to back and hear how closely your backwards impression landed.',
];
export function ReverseScreen() {
  const s = useResponsiveStyles();
  const layout = useLayout();
  const [step, setStep] = useState(0);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [original, setOriginal] = useState<Recording | null>(null);
  const [attempt, setAttempt] = useState<Recording | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(64).fill(0));
  const [playing, setPlaying] = useState<string | null>(null);
  const focused = useIsFocused();
  const lock = useRef(false);
  const active = useRef(false);
  const files = useRef({ original, attempt });
  files.current = { original, attempt };
  const fail = useCallback(
    (error: unknown) =>
      Alert.alert(
        'Audio Lab',
        error instanceof Error ? error.message : String(error),
      ),
    [],
  );
  const stop = useCallback(async () => {
    if (lock.current || !active.current) {
      return;
    }
    lock.current = true;
    active.current = false;
    setRecording(false);
    setBusy(true);
    try {
      const result = await audio.stop();
      setSeconds(result.duration);
      if (step === 0) {
        await audio.remove(original);
        setOriginal(result);
      } else {
        await audio.remove(attempt);
        setAttempt(result);
      }
    } catch (error) {
      fail(error);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }, [step, original, attempt, fail]);
  useEffect(() => {
    if (!recording) {
      return;
    }
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - startedAt >= 15000) {
        stop();
        return;
      }
      audio
        .level()
        .then(value => {
          setSeconds(value.seconds);
          setLevels(v => [...v.slice(1), Math.min(1, value.level * 3)]);
          if (value.seconds >= 14.8) {
            stop();
          }
        })
        .catch(fail);
    }, 80);
    return () => clearInterval(timer);
  }, [recording, stop, fail]);
  useEffect(() => {
    if (!focused) {
      audio.stopPlayback();
      setPlaying(null);
      if (active.current) {
        stop();
      }
    }
  }, [focused, stop]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', status => {
      if (status !== 'active') {
        audio.stopPlayback();
        setPlaying(null);
        if (active.current) {
          stop();
        }
      }
    });
    return () => sub.remove();
  }, [stop]);
  useEffect(
    () => () => {
      audio.cancel();
      audio.remove(files.current.original);
      audio.remove(files.current.attempt);
    },
    [],
  );
  const start = async () => {
    if (lock.current) {
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      await audio.start();
      active.current = true;
      setRecording(true);
      setSeconds(0);
      setLevels(Array(64).fill(0));
    } catch (error) {
      fail(error);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const play = async (path: string) => {
    if (playing === path) {
      audio.stopPlayback();
      setPlaying(null);
      return;
    }
    audio.stopPlayback();
    setPlaying(path);
    try {
      await audio.play(path);
    } catch (error) {
      fail(error);
    } finally {
      setPlaying(v => (v === path ? null : v));
    }
  };
  const next = () => {
    audio.stopPlayback();
    setPlaying(null);
    setSeconds(0);
    setStep(v => v + 1);
  };
  const reset = async (keep = false) => {
    audio.stopPlayback();
    await audio.remove(attempt);
    setAttempt(null);
    if (!keep) {
      await audio.remove(original);
      setOriginal(null);
    }
    setStep(keep ? 2 : 0);
    setSeconds(0);
    setLevels(Array(64).fill(0));
  };
  const current = step < 2 ? original : attempt;
  const showRecord = step === 0 || step === 2;
  const normalized = (v: number[]) => {
    const max = Math.max(0.03, ...v);
    return v.map(x => x / max);
  };
  const score =
    original && attempt
      ? similarity(
          original.envelope,
          [...attempt.envelope].reverse(),
          original.duration,
          attempt.duration,
        )
      : 0;
  return (
    <Screen tab animationKey={step}>
      <Header title="Reverse Lab" />
      <View style={s.between}>
        <Text style={s.muted}>Say it backwards, forwards</Text>
        <Text style={s.label}>
          {step === 4 ? 'RESULT' : `STEP ${step + 1}/4`}
        </Text>
      </View>
      <StepProgress current={Math.min(step + 1, 4)} total={4} />
      <Card>
        <Text style={s.label}>
          {step === 4 ? 'RESULT' : `STEP ${step + 1} OF 4`}
        </Text>
        <Text style={s.heading}>{titles[step]}</Text>
        <Text style={s.muted}>{bodies[step]}</Text>
      </Card>
      {step > 0 && step < 4 && original && (
        <Card>
          <View style={s.between}>
            <Text style={s.label}>
              {step === 3
                ? 'YOUR ATTEMPT · REVERSED'
                : 'REFERENCE · REVERSED ORIGINAL'}
            </Text>
            <Pressable
              disabled={recording || busy}
              onPress={() =>
                play(
                  step === 3 && attempt ? attempt.reversed : original.reversed,
                )
              }
            >
              <Text style={s.label}>{playing ? '■ Stop' : '▶ Play'}</Text>
            </Pressable>
          </View>
          <Wave
            values={normalized(
              [
                ...(step === 3 && attempt ? attempt : original).envelope,
              ].reverse(),
            )}
            color={colors.teal}
          />
        </Card>
      )}
      {step < 4 ? (
        <>
          <Card
            style={{
              alignItems: 'center',
              paddingVertical: layout.compact ? 16 : 25,
              gap: layout.compact ? 16 : 24,
            }}
          >
            <Text
              style={{
                fontSize: 30,
                color: recording ? colors.danger : colors.text,
                fontFamily: mono,
              }}
            >
              {Math.floor(seconds / 60)
                .toString()
                .padStart(2, '0')}
              :{(seconds % 60).toFixed(1).padStart(4, '0')}
            </Text>
            <Wave
              values={
                recording
                  ? levels
                  : current
                  ? normalized(current.envelope)
                  : Array(64).fill(0)
              }
            />
            {showRecord && (
              <Pressable
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={
                  recording ? 'Stop recording' : 'Start recording'
                }
                onPress={recording ? stop : start}
              >
                <LinearGradient
                  colors={
                    recording
                      ? [colors.surfaceHighlight, colors.button]
                      : [colors.buttonHighlight, colors.button]
                  }
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: recording ? 24 : 29,
                      height: recording ? 24 : 29,
                      borderRadius: recording ? 6 : 20,
                      backgroundColor: recording ? colors.danger : colors.text,
                    }}
                  />
                </LinearGradient>
              </Pressable>
            )}
            <Text style={[s.label, { color: colors.muted }]}>
              {busy
                ? 'PROCESSING…'
                : recording
                ? 'RECORDING · TAP TO STOP'
                : showRecord
                ? 'TAP TO RECORD · MAX 15 SECONDS'
                : 'RECORDING CAPTURED'}
            </Text>
          </Card>
          <ActionRow>
            <Button
              style={{ flex: 1 }}
              secondary
              title={playing ? '■ Stop' : '▶ Playback'}
              disabled={!current || recording || busy}
              onPress={() =>
                current &&
                play(
                  step === 1
                    ? current.reversed
                    : step === 3
                    ? current.reversed
                    : current.path,
                )
              }
            />
            <Button
              style={{ flex: 1 }}
              disabled={!current || recording || busy}
              title={
                [
                  'Reverse It',
                  'I’m Ready',
                  'Reverse My Take',
                  'See Comparison',
                ][step]
              }
              onPress={next}
            />
          </ActionRow>
          <Card>
            <Text style={s.muted}>
              {step === 0
                ? 'Hold the phone about 20 cm away. Recordings stay on this device and are removed when you start a new round.'
                : step === 2
                ? 'Match duration before accuracy: length differences affect the envelope comparison.'
                : 'Focus on the envelope first — where it swells and where it stops — then the vowels.'}
            </Text>
          </Card>
        </>
      ) : (
        <>
          {original &&
            attempt &&
            [
              {
                label: 'Original recording',
                file: original,
                path: original.path,
                values: original.envelope,
                color: colors.gold,
              },
              {
                label: 'Your reversed attempt',
                file: attempt,
                path: attempt.reversed,
                values: [...attempt.envelope].reverse(),
                color: colors.teal,
              },
            ].map(item => (
              <Card key={item.label}>
                <View style={s.between}>
                  <Text style={s.text}>{item.label}</Text>
                  <Text style={s.label}>{item.file.duration.toFixed(2)} s</Text>
                </View>
                <Pressable
                  onPress={() => play(item.path)}
                  accessibilityLabel={`Play ${item.label}`}
                >
                  <Wave values={normalized(item.values)} color={item.color} />
                  <Text style={[s.chipText, { color: item.color }]}>
                    {playing === item.path ? '■ Stop' : '▶ Play'}
                  </Text>
                </Pressable>
              </Card>
            ))}
          <Card>
            <ActionRow>
              <Ring value={score / 100} label="MATCH" />
              <View style={{ flex: 1 }}>
                <Text style={s.heading}>
                  {score >= 70 ? 'Close match' : 'Keep experimenting'}
                </Text>
                <Text style={s.muted}>
                  Envelope and duration similarity. This compares timing and
                  energy, not speech recognition.
                </Text>
              </View>
            </ActionRow>
          </Card>
          <ActionRow>
            <Button
              style={{ flex: 1 }}
              title="Try Again"
              onPress={() => reset(true)}
            />
            <Button
              style={{ flex: 1 }}
              secondary
              title="New Recording"
              onPress={() => reset()}
            />
          </ActionRow>
        </>
      )}
    </Screen>
  );
}
