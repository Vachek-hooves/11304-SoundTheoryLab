import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import { decodeWav, encodeWav, envelope, reversePcm } from '../utils/wav';
export type Recording = {
  path: string;
  reversed: string;
  duration: number;
  envelope: number[];
};
const native = NativeModules.AudioLab as {
  start: () => Promise<string>;
  stop: () => Promise<{ path: string; raw: boolean; sampleRate: number }>;
  level: () => Promise<{ level: number; seconds: number }>;
  play: (path: string) => Promise<boolean>;
  stopPlayback: () => void;
  cancel: () => void;
};
export const audio = {
  async start() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error(
          'Allow microphone access in Settings to record your voice.',
        );
      }
    }
    native.stopPlayback();
    await native.start();
  },
  async stop(): Promise<Recording> {
    const file = await native.stop();
    const bytes = Buffer.from(
      await RNFS.readFile(file.path, 'base64'),
      'base64',
    );
    const { pcm, sampleRate } = file.raw
      ? { pcm: bytes, sampleRate: file.sampleRate }
      : decodeWav(bytes);
    if (pcm.length < sampleRate * 0.25 * 2) {
      throw new Error('Record at least a quarter of a second and try again.');
    }
    const path = `${RNFS.CachesDirectoryPath}/voice-${Date.now()}.wav`;
    const reversed = path.replace('.wav', '-reverse.wav');
    await RNFS.writeFile(
      path,
      encodeWav(pcm, sampleRate).toString('base64'),
      'base64',
    );
    await RNFS.writeFile(
      reversed,
      encodeWav(reversePcm(pcm), sampleRate).toString('base64'),
      'base64',
    );
    await RNFS.unlink(file.path).catch(() => {});
    return {
      path,
      reversed,
      duration: pcm.length / 2 / sampleRate,
      envelope: envelope(pcm),
    };
  },
  level: () => native.level(),
  play: (path: string) => native.play(path),
  stopPlayback: () => native.stopPlayback(),
  cancel: () => native.cancel(),
  async remove(recording: Recording | null) {
    if (recording) {
      await Promise.all([
        RNFS.unlink(recording.path).catch(() => {}),
        RNFS.unlink(recording.reversed).catch(() => {}),
      ]);
    }
  },
};
