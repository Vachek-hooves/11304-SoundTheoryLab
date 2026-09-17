import { Buffer } from 'buffer';
import { calculate, calculations } from '../src/utils/calculations';
import {
  decodeWav,
  encodeWav,
  envelope,
  reversePcm,
  similarity,
} from '../src/utils/wav';
import { histogram, statistics, trial } from '../src/utils/simulation';
import formulas from '../src/data/formulas.json';
import modules from '../src/data/modules.json';
import glossary from '../src/data/glossary.json';
import questions from '../src/data/questions.json';

test('all supplied educational content has been imported and every formula is executable', () => {
  expect(formulas).toHaveLength(86);
  expect(glossary).toHaveLength(60);
  expect(modules.flatMap(m => m.lessons)).toHaveLength(31);
  expect(questions).toHaveLength(40);
  formulas.forEach(f => expect(calculations[f.id]).toBeDefined());
  questions.forEach(q => {
    expect(q.options).toHaveLength(4);
    expect(q.answer).toBeGreaterThanOrEqual(0);
    expect(q.answer).toBeLessThan(4);
  });
});
test('calculates physical relationships and logarithmic conversions', () => {
  expect(calculate('2', ['440']).value).toBeCloseTo(1 / 440, 8);
  expect(calculate('4', ['343', '50']).value).toBeCloseTo(6.86);
  expect(calculate('14', ['1', '343', '5']).value).toBeCloseTo(34.3);
  expect(calculate('24', ['120']).value).toBe(500);
  expect(calculate('39', ['6']).value).toBeCloseTo(1.99526);
  expect(calculate('41', ['80,80']).value).toBeCloseTo(83.0103);
  expect(calculate('26', ['-1,1']).value).toBe(1);
  expect(calculate('80', ['69']).value).toBe(440);
  expect(calculate('63', ['0.5,20,0.25,40']).value).toBe(20);
});
test('rejects invalid, incomplete and undefined calculations', () => {
  expect(calculate('2', [''])).toEqual({});
  expect(calculate('2', ['0']).error).toBeDefined();
  expect(calculate('4', ['343', '-20']).error).toBeDefined();
  expect(calculate('7', ['0']).error).toBeDefined();
  expect(calculate('73', ['1.5']).error).toBeDefined();
  expect(calculate('26', ['1,,2']).error).toBeDefined();
});
test('reverses PCM sample order losslessly and retains the WAV sample rate', () => {
  const pcm = Buffer.alloc(8);
  [-32000, 123, 32000, -78].forEach((v, i) => pcm.writeInt16LE(v, i * 2));
  const reversed = reversePcm(pcm);
  expect([0, 1, 2, 3].map(i => reversed.readInt16LE(i * 2))).toEqual([
    -78, 32000, 123, -32000,
  ]);
  expect(reversePcm(reversed).equals(pcm)).toBe(true);
  const decoded = decodeWav(encodeWav(pcm, 22050));
  expect(decoded.sampleRate).toBe(22050);
  expect(decoded.pcm.equals(pcm)).toBe(true);
  expect(envelope(pcm, 4)).toHaveLength(4);
  expect(similarity([0, 0.5, 1], [0, 0.5, 1], 2, 2)).toBe(100);
  expect(similarity([0, 0], [0, 0], 2, 2)).toBe(0);
});
test('measures synthesized frequency and derives statistics from trials', () => {
  const p = {
    frequency: 120,
    amplitude: 0.82,
    phase: 45,
    variation: 0,
    noise: -80,
    repetitions: 10,
    samples: 2048,
  };
  expect(trial(p, () => 0.5)).toBeCloseTo(120, 1);
  const stats = statistics([100, 110, 120]);
  expect(stats.mean).toBe(110);
  expect(stats.variance).toBeCloseTo(200 / 3);
  expect(histogram([100, 110, 120]).reduce((a, b) => a + b, 0)).toBe(3);
});
