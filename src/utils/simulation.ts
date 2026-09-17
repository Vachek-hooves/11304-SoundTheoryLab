export type Parameters = {
  frequency: number;
  amplitude: number;
  phase: number;
  variation: number;
  noise: number;
  repetitions: number;
  samples: number;
};
export function trial(p: Parameters, random = Math.random): number {
  const f = p.frequency * (1 + ((random() * 2 - 1) * p.variation) / 100);
  const sampleRate = 4096;
  const phase = (p.phase * Math.PI) / 180;
  const noise = 10 ** (p.noise / 20);
  const data = new Float64Array(p.samples);
  for (let i = 0; i < p.samples; i++) {
    data[i] =
      p.amplitude * Math.sin((2 * Math.PI * f * i) / sampleRate + phase) +
      (random() * 2 - 1) * noise * Math.sqrt(3);
  }
  const crossings: number[] = [];
  const threshold = p.amplitude * 0.15;
  let armed = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i] < -threshold) {
      armed = true;
    }
    if (armed && data[i - 1] <= 0 && data[i] > 0) {
      crossings.push(i - 1 - data[i - 1] / (data[i] - data[i - 1]));
      armed = false;
    }
  }
  return crossings.length > 1
    ? (sampleRate * (crossings.length - 1)) /
        (crossings[crossings.length - 1] - crossings[0])
    : 0;
}
export function statistics(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const deviation = Math.sqrt(variance);
  return {
    mean,
    variance,
    deviation,
    min: Math.min(...values),
    max: Math.max(...values),
    within:
      (values.filter(v => Math.abs(v - mean) <= deviation + 1e-9).length /
        values.length) *
      100,
  };
}
export function histogram(values: number[], bins = 16) {
  const { min, max } = statistics(values);
  const counts = Array(bins).fill(0) as number[];
  values.forEach(
    v =>
      counts[
        Math.min(bins - 1, Math.floor(((v - min) / (max - min || 1)) * bins))
      ]++,
  );
  return counts;
}
