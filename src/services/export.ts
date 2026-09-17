import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Clipboard from '@react-native-clipboard/clipboard';
import { generatePDF } from 'react-native-html-to-pdf';
import { SimulationRun } from '../state/AppState';
import { statistics } from '../utils/simulation';
export async function exportRun(
  run: SimulationRun,
  type: 'csv' | 'pdf' | 'copy',
) {
  const stats = statistics(run.values);
  const summary = `Big Sound · Simulation\n${new Date(
    run.date,
  ).toLocaleString()}\nExpected: ${
    run.frequency
  } Hz\nMean: ${stats.mean.toFixed(
    3,
  )} Hz\nStandard deviation: ${stats.deviation.toFixed(
    3,
  )} Hz\nRange: ${stats.min.toFixed(3)}–${stats.max.toFixed(3)} Hz\nTrials: ${
    run.values.length
  }\nSample size: ${run.samples}\nAmplitude: ${run.amplitude} FS\nPhase: ${
    run.phase
  }°\nVariation: ±${run.variation}%\nNoise: ${run.noise} dBFS`;
  if (type === 'copy') {
    Clipboard.setString(summary);
    return;
  }
  if (type === 'csv') {
    const path = `${RNFS.CachesDirectoryPath}/simulation-${run.id}.csv`;
    await RNFS.writeFile(
      path,
      `trial,frequency_hz,expected_hz,amplitude_fs,phase_deg,variation_pct,noise_dbfs,samples\n${run.values
        .map(
          (v, i) =>
            `${i + 1},${v},${run.frequency},${run.amplitude},${run.phase},${
              run.variation
            },${run.noise},${run.samples}`,
        )
        .join('\n')}`,
      'utf8',
    );
    await Share.open({
      url: `file://${path}`,
      type: 'text/csv',
      failOnCancel: false,
    });
    return;
  }
  const report = await generatePDF({
    html: `<html><body style="font-family:Helvetica;padding:32px"><h1>Big Sound</h1><h2>Signal simulation report</h2><pre style="font-size:14px;line-height:1.8">${summary}</pre><p>Monte Carlo trials use a synthesized sine wave, uniform frequency variation, additive uniform noise and rising zero-crossing frequency estimation at 4096 samples/second.</p></body></html>`,
    fileName: `simulation-${run.id}`,
  });
  if (!report.filePath) {
    throw new Error('Unable to create the PDF report.');
  }
  await Share.open({
    url: `file://${report.filePath}`,
    type: 'application/pdf',
    failOnCancel: false,
  });
}
