import { mean, number, random, count } from '../../lib/common.js';
export function diagnose(samples, baseline = { latency_ms: 30, throughput_mbps: 20 }) {
  if (!Array.isArray(samples) || !samples.length) throw new Error('Provide a nonempty measurement array.');
  const rows = samples.map(s => ({
    latency: number(s.latency_ms, 'Latency'), loss: number(s.packet_loss, 'Packet loss', 0, 1),
    throughput: number(s.throughput_mbps, 'Throughput')
  }));
  const latency = mean(rows.map(s => s.latency));
  const loss = mean(rows.map(s => s.loss));
  const throughput = mean(rows.map(s => s.throughput));
  const jitter = mean(rows.slice(1).map((s, i) => Math.abs(s.latency - rows[i].latency)));
  const observations = [], possibleCauses = [], nextTests = [];
  if (latency > Math.max(100, baseline.latency_ms * 3)) observations.push('High RTT');
  if (loss > .01) observations.push('Packet loss');
  if (throughput < baseline.throughput_mbps * .4) observations.push('Reduced throughput');
  if (jitter > 30) observations.push('Unstable latency');
  if (observations.includes('High RTT') && observations.includes('Reduced throughput')) possibleCauses.push('Congestion or bandwidth bottleneck');
  if (loss > .01) possibleCauses.push('Lossy link or queue overflow');
  if (observations.length) nextTests.push('Compare individual hop measurements with the baseline', 'Repeat measurements during a quiet period');
  return { status: observations.length ? 'Degraded' : 'Healthy', latency_ms: latency, packet_loss: loss, throughput_mbps: throughput, jitter_ms: jitter, observations, possibleCauses, nextTests };
}
export function generate({ scenario = 'healthy', seed = 42, size = 30 } = {}) {
  const rng = random(seed); count(size, 'Sample count');
  const profiles = { healthy: [30, .001, 20], congestion: [220, .04, 3], loss: [40, .15, 12], jitter: [80, .01, 16] };
  if (!profiles[scenario]) throw new Error('Unknown scenario.');
  const [latency, loss, throughput] = profiles[scenario];
  return Array.from({ length: size }, (_, i) => ({ time: i, source: 'client_A', destination: 'server', latency_ms: Math.max(1, latency + (rng() - .5) * (scenario === 'jitter' ? 180 : 20)), packet_loss: loss, throughput_mbps: throughput * (.8 + rng() * .4) }));
}
