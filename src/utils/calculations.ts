export type Calculation = {
  fields: string[];
  unit: string;
  run: (v: number[]) => number;
  lists?: boolean;
  signed?: boolean;
};
const c = (
  fields: string[],
  unit: string,
  run: (v: number[]) => number,
  signed = false,
): Calculation => ({ fields, unit, run, signed });
const log = Math.log10;
const pi = Math.PI;
export const calculations: Record<string, Calculation> = {
  '1': c(['Frequency · Hz', 'Wavelength · m'], 'm/s', ([f, l]) => f * l),
  '2': c(['Frequency · Hz'], 's', ([f]) => 1 / f),
  '3': c(['Period · s'], 'Hz', ([t]) => 1 / t),
  '4': c(['Speed of sound · m/s', 'Frequency · Hz'], 'm', ([v, f]) => v / f),
  '5': c(['Speed of sound · m/s', 'Wavelength · m'], 'Hz', ([v, l]) => v / l),
  '6': c(['Temperature · °C'], 'm/s', ([t]) => 331.3 + 0.606 * t, true),
  '7': c(['RMS pressure · Pa'], 'dB SPL', ([p]) => 20 * log(p / 0.00002)),
  '8': c(
    ['Sound pressure level · dB SPL'],
    'Pa',
    ([l]) => 0.00002 * 10 ** (l / 20),
    true,
  ),
  '9': c(
    ['Original amplitude', 'New amplitude'],
    'dB',
    ([a, b]) => 20 * log(b / a),
  ),
  '10': c(
    ['Original power · W', 'New power · W'],
    'dB',
    ([a, b]) => 10 * log(b / a),
  ),
  '11': c(['Power · W', 'Area · m²'], 'W/m²', ([p, a]) => p / a),
  '12': c(
    ['Original intensity · W/m²', 'Original distance · m', 'New distance · m'],
    'W/m²',
    ([i, a, b]) => i * (a / b) ** 2,
  ),
  '13': c(
    ['Original distance · m', 'New distance · m'],
    'dB',
    ([a, b]) => 20 * log(a / b),
  ),
  '14': c(
    ['Mode order', 'Speed of sound · m/s', 'Room length · m'],
    'Hz',
    ([n, v, l]) => (n * v) / (2 * l),
  ),
  '15': c(
    [
      'Speed of sound · m/s',
      'Mode nx',
      'Mode ny',
      'Mode nz',
      'Length · m',
      'Width · m',
      'Height · m',
    ],
    'Hz',
    ([v, x, y, z, l, w, h]) => (v / 2) * Math.hypot(x / l, y / w, z / h),
  ),
  '16': c(
    ['Path difference · m', 'Wavelength · m'],
    '°',
    ([d, l]) => (360 * d) / l,
    true,
  ),
  '17': c(['Frequency · Hz', 'Delay · s'], '°', ([f, t]) => 360 * f * t),
  '18': c(['Distance · m', 'Speed of sound · m/s'], 's', ([d, v]) => d / v),
  '19': c(['Speed of sound · m/s', 'Delay · s'], 'm', ([v, t]) => v * t),
  '20': c(['Harmonic number', 'Fundamental · Hz'], 'Hz', ([n, f]) => n * f),
  '21': c(['Frequency · Hz', 'Octaves'], 'Hz', ([f, n]) => f * 2 ** n, true),
  '22': c(
    ['Frequency · Hz', 'Semitones'],
    'Hz',
    ([f, n]) => f * 2 ** (n / 12),
    true,
  ),
  '23': c(['Tempo · BPM'], 's', ([b]) => 60 / b),
  '24': c(['Tempo · BPM'], 'ms', ([b]) => 60000 / b),
  '25': c(
    ['Tempo · BPM', 'Note denominator'],
    'ms',
    ([b, n]) => 240000 / (b * n),
  ),
  '26': {
    ...c(
      ['Sample values · comma separated'],
      'RMS',
      v => Math.sqrt(v.reduce((a, b) => a + b * b, 0) / v.length),
      true,
    ),
    lists: true,
  },
  '27': c(['Peak amplitude'], 'RMS', ([a]) => a / Math.SQRT2),
  '28': c(['Peak level · dB', 'RMS level · dB'], 'dB', ([p, r]) => p - r, true),
  '29': c(['Sample rate · Hz'], 'Hz', ([f]) => f / 2),
  '30': c(['Sample rate · Hz', 'FFT size'], 'Hz', ([f, n]) => f / n),
  '31': c(['Bit depth'], 'dB', ([n]) => 6.02 * n + 1.76),
  '32': c(['Sample rate · Hz', 'Duration · s'], 'samples', ([f, t]) => f * t),
  '33': c(
    ['Sample rate · Hz', 'Bit depth', 'Channels', 'Duration · s'],
    'bytes',
    ([f, b, c1, t]) => (f * b * c1 * t) / 8,
  ),
  '34': c(
    ['Original frequency · Hz', 'New frequency · Hz'],
    'octaves',
    ([a, b]) => Math.log2(b / a),
  ),
  '35': c(['Center frequency · Hz', 'Bandwidth · Hz'], 'Q', ([f, b]) => f / b),
  '36': c(['Center frequency · Hz', 'Q factor'], 'Hz', ([f, q]) => f / q),
  '37': c(['Intensity · W/m²'], 'dB', ([i]) => 10 * log(i / 1e-12)),
  '38': c(['Power · W'], 'dB', ([w]) => 10 * log(w / 1e-12)),
  '39': c(['Level difference · dB'], '×', ([l]) => 10 ** (l / 20), true),
  '40': c(['Level difference · dB'], '×', ([l]) => 10 ** (l / 10), true),
  '41': {
    ...c(
      ['Independent levels · dB, comma separated'],
      'dB',
      v => 10 * log(v.reduce((a, b) => a + 10 ** (b / 10), 0)),
      true,
    ),
    lists: true,
  },
  '42': c(['Source level · dB'], 'dB', ([l]) => l + 10 * log(2), true),
  '43': c(['Gain · dB'], '×', ([l]) => 10 ** (l / 20), true),
  '44': c(['Linear gain'], 'dB', ([g]) => 20 * log(g)),
  '45': c(
    ['Signal amplitude', 'Full-scale amplitude'],
    'dBFS',
    ([x, f]) => 20 * log(Math.abs(x) / f),
    true,
  ),
  '46': c(['Peak level · dBFS'], 'dB', ([p]) => -p, true),
  '47': c(
    ['Signal RMS amplitude', 'Noise RMS amplitude'],
    'dB',
    ([a, b]) => 20 * log(a / b),
  ),
  '48': {
    ...c(
      ['Fundamental, then harmonic amplitudes · comma separated'],
      '%',
      ([f, ...v]) => (Math.hypot(...v) / f) * 100,
    ),
    lists: true,
  },
  '49': c(['Frequency · Hz'], 'rad/s', ([f]) => 2 * pi * f),
  '50': c(['Wavelength · m'], 'rad/m', ([l]) => (2 * pi) / l),
  '51': c(
    ['Angular frequency · rad/s', 'Wavenumber · rad/m'],
    'm/s',
    ([w, k]) => w / k,
  ),
  '52': c(['Sample rate · Hz', 'Frequency · Hz'], 'samples', ([s, f]) => s / f),
  '53': c(['Sample rate · Hz', 'Samples per cycle'], 'Hz', ([s, n]) => s / n),
  '54': c(['Sample rate · Hz', 'Delay · s'], 'samples', ([s, t]) => s * t),
  '55': c(
    ['Phase · °', 'Frequency · Hz'],
    's',
    ([p, f]) => p / (360 * f),
    true,
  ),
  '56': c(['Delay · s'], 'Hz', ([t]) => 1 / t),
  '57': c(['Comb spacing · Hz'], 's', ([f]) => 1 / f),
  '58': c(
    ['Speed of sound · m/s', 'Frequency · Hz'],
    'm',
    ([v, f]) => v / (4 * f),
  ),
  '59': c(
    ['Speed of sound · m/s', 'Frequency · Hz'],
    'm',
    ([v, f]) => v / (2 * f),
  ),
  '60': c(
    ['Speed of sound · m/s', 'Length · m'],
    'Hz',
    ([v, l]) => v / (4 * l),
  ),
  '61': c(
    ['Speed of sound · m/s', 'Length · m'],
    'Hz',
    ([v, l]) => v / (2 * l),
  ),
  '62': c(
    [
      'Speed of sound · m/s',
      'Neck area · m²',
      'Cavity volume · m³',
      'Effective neck length · m',
    ],
    'Hz',
    ([v, a, b, l]) => (v / (2 * pi)) * Math.sqrt(a / (b * l)),
  ),
  '63': {
    ...c(['Coefficient, area pairs · comma separated'], 'm² sabins', v =>
      v.length % 2
        ? NaN
        : v.reduce((a, b, i) => (i % 2 ? a : a + b * v[i + 1]), 0),
    ),
    lists: true,
  },
  '64': c(
    ['Room volume · m³', 'Absorption area · m²'],
    's',
    ([v, a]) => (0.161 * v) / a,
  ),
  '65': c(
    ['RT60 · s', 'Room volume · m³'],
    'Hz',
    ([t, v]) => 2000 * Math.sqrt(t / v),
  ),
  '66': c(
    ['Pressure · Pa', 'Particle velocity · m/s'],
    'Pa·s/m',
    ([p, u]) => p / u,
  ),
  '67': c(
    ['Pressure · Pa', 'Density · kg/m³', 'Speed of sound · m/s'],
    'm/s',
    ([p, d, v]) => p / (d * v),
  ),
  '68': c(
    ['RMS pressure · Pa', 'Density · kg/m³', 'Speed of sound · m/s'],
    'W/m²',
    ([p, d, v]) => (p * p) / (d * v),
  ),
  '69': c(
    ['Power · W', 'Distance · m'],
    'W/m²',
    ([w, r]) => w / (4 * pi * r * r),
  ),
  '70': c(
    ['Intensity · W/m²', 'Distance · m'],
    'W',
    ([i, r]) => 4 * pi * r * r * i,
  ),
  '71': c(
    ['Impedance Z₁', 'Impedance Z₂'],
    'ratio',
    ([a, b]) => (b - a) / (b + a),
  ),
  '72': c(['Pressure reflection coefficient'], 'ratio', ([r]) => r * r, true),
  '73': c(['Reflected intensity ratio'], 'α', ([r]) => 1 - r),
  '74': c(['Transmission coefficient'], 'dB', ([t]) => 10 * log(1 / t)),
  '75': c(['Directivity factor'], 'dB', ([q]) => 10 * log(q)),
  '76': c(
    ['Directivity factor', 'Room volume · m³', 'RT60 · s'],
    'm',
    ([q, v, t]) => 0.057 * Math.sqrt((q * v) / t),
  ),
  '77': c(['Frequency 1 · Hz', 'Frequency 2 · Hz'], 'Hz', ([a, b]) =>
    Math.abs(a - b),
  ),
  '78': c(
    ['Original frequency · Hz', 'New frequency · Hz'],
    'cents',
    ([a, b]) => 1200 * Math.log2(b / a),
  ),
  '79': c(
    ['Frequency · Hz', 'Cents offset'],
    'Hz',
    ([f, c1]) => f * 2 ** (c1 / 1200),
    true,
  ),
  '80': c(['MIDI note number'], 'Hz', ([n]) => 440 * 2 ** ((n - 69) / 12)),
  '81': c(['Frequency · Hz'], 'MIDI', ([f]) => 69 + 12 * Math.log2(f / 440)),
  '82': c(
    ['Left amplitude', 'Right amplitude'],
    'amplitude',
    ([l, r]) => (l + r) / 2,
    true,
  ),
  '83': c(
    ['Left amplitude', 'Right amplitude'],
    'amplitude',
    ([l, r]) => (l - r) / 2,
    true,
  ),
  '84': c(
    ['Mid amplitude', 'Side amplitude'],
    'amplitude',
    ([m, s]) => m + s,
    true,
  ),
  '85': c(
    ['Mid amplitude', 'Side amplitude'],
    'amplitude',
    ([m, s]) => m - s,
    true,
  ),
  '86': c(
    [
      'Source frequency · Hz',
      'Speed of sound · m/s',
      'Listener velocity toward source · m/s',
      'Source velocity toward listener · m/s',
    ],
    'Hz',
    ([f, v, o, s]) => (f * (v + o)) / (v - s),
    true,
  ),
};
export function calculate(
  id: string,
  raw: string[],
): { value?: number; error?: string } {
  const def = calculations[id];
  if (raw.some(v => !v.trim())) {
    return {};
  }
  if (def.lists && /[,;]\s*[,;]/.test(raw[0])) {
    return { error: 'Enter a value between each separator.' };
  }
  const tokens = def.lists
    ? raw[0].split(/[,;\s]+/)
    : raw.map(v => v.replace(',', '.'));
  if (tokens.some(t => !t.trim())) {
    return { error: 'Enter a value between each separator.' };
  }
  const values = tokens.map(Number);
  if (values.some(v => !Number.isFinite(v))) {
    return { error: 'Enter valid numeric values.' };
  }
  if (!def.signed && values.some(v => v < 0)) {
    return { error: 'These values must be non-negative.' };
  }
  if (['73', '74'].includes(id) && (values[0] > 1 || values[0] < 0)) {
    return { error: 'Enter a coefficient between 0 and 1.' };
  }
  if (id === '80' && (values[0] > 127 || !Number.isInteger(values[0]))) {
    return { error: 'MIDI notes range from 0 to 127.' };
  }
  if (id === '48' && values.length < 2) {
    return { error: 'Enter a fundamental and at least one harmonic.' };
  }
  const positiveFields =
    /Frequency|frequency|Wavelength|wavelength|Speed of sound|Sample rate|FFT size|Room length|Length|Width|Height|Bandwidth|Q factor|Tempo|denominator|Bit depth|Channels|Density|volume|Impedance|Absorption area|Directivity factor/;
  if (
    !def.lists &&
    def.fields.some(
      (field, index) => positiveFields.test(field) && values[index] <= 0,
    )
  ) {
    return {
      error:
        'Frequencies, dimensions and physical scale values must be greater than zero.',
    };
  }
  if (id === '6' && values[0] <= -273.15) {
    return { error: 'Temperature must be above absolute zero.' };
  }
  if (id === '28' && values[0] < values[1]) {
    return { error: 'Peak level cannot be below RMS level.' };
  }
  if (id === '46' && values[0] > 0) {
    return { error: 'A digital peak must be at or below 0 dBFS.' };
  }
  if (id === '72' && Math.abs(values[0]) > 1) {
    return { error: 'Enter a reflection coefficient from −1 to 1.' };
  }
  if (
    id === '63' &&
    values.some((value, index) => (index % 2 === 0 ? value > 1 : value <= 0))
  ) {
    return {
      error:
        'Use coefficient/area pairs, with coefficients from 0 to 1 and positive areas.',
    };
  }
  if (
    id === '86' &&
    (Math.abs(values[2]) >= values[1] || Math.abs(values[3]) >= values[1])
  ) {
    return {
      error: 'This model requires subsonic source and listener velocities.',
    };
  }
  const value = def.run(values);
  return Number.isFinite(value)
    ? { value }
    : {
        error:
          'These values are outside the formula’s domain. Check for zero denominators and logarithms.',
      };
}
export function format(value: number) {
  return Math.abs(value) > 0 &&
    (Math.abs(value) < 0.0001 || Math.abs(value) >= 1e8)
    ? value.toExponential(4)
    : Number(value.toFixed(5)).toString();
}
