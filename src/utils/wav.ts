import { Buffer } from 'buffer';
export function encodeWav(pcm: Buffer, sampleRate: number) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}
export function decodeWav(data: Buffer) {
  if (data.toString('ascii', 0, 4) !== 'RIFF') {
    throw new Error('Unsupported recording format.');
  }
  let offset = 12,
    sampleRate = 22050,
    pcm: Buffer | undefined;
  while (offset + 8 <= data.length) {
    const kind = data.toString('ascii', offset, offset + 4),
      size = data.readUInt32LE(offset + 4);
    if (kind === 'fmt ') {
      if (
        data.readUInt16LE(offset + 8) !== 1 ||
        data.readUInt16LE(offset + 10) !== 1 ||
        data.readUInt16LE(offset + 22) !== 16
      ) {
        throw new Error('Recording must be mono, 16-bit PCM.');
      }
      sampleRate = data.readUInt32LE(offset + 12);
    }
    if (kind === 'data') {
      pcm = Buffer.from(
        data.subarray(offset + 8, Math.min(data.length, offset + 8 + size)),
      );
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (!pcm || pcm.length < 2) {
    throw new Error('The recording is empty. Please record again.');
  }
  return { pcm, sampleRate };
}
export function reversePcm(pcm: Buffer) {
  const out = Buffer.alloc(pcm.length);
  for (let i = 0; i < pcm.length / 2; i++) {
    out.writeInt16LE(pcm.readInt16LE(i * 2), pcm.length - 2 - i * 2);
  }
  return out;
}
export function envelope(pcm: Buffer, bins = 64) {
  const frames = pcm.length / 2;
  return Array.from({ length: bins }, (_, bin) => {
    const start = Math.floor((bin * frames) / bins),
      end = Math.floor(((bin + 1) * frames) / bins);
    let energy = 0;
    for (let i = start; i < end; i++) {
      energy += (pcm.readInt16LE(i * 2) / 32768) ** 2;
    }
    return Math.sqrt(energy / Math.max(1, end - start));
  });
}
export function similarity(
  a: number[],
  b: number[],
  durationA: number,
  durationB: number,
) {
  const maxA = Math.max(...a),
    maxB = Math.max(...b);
  if (maxA < 0.001 || maxB < 0.001) {
    return 0;
  }
  const error =
    a.reduce((sum, v, i) => sum + Math.abs(v / maxA - b[i] / maxB), 0) /
    a.length;
  const duration =
    Math.min(durationA, durationB) / Math.max(durationA, durationB);
  return Math.round(Math.max(0, Math.min(1, (1 - error) * duration)) * 100);
}
