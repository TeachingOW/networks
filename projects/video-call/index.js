import { random, mean, number, count } from '../../lib/common.js';
export function simulateVideo({ bandwidth = 5, delay = 80, jitter = 20, loss = .01, buffer = 120, adaptive = true, frames = 300, seed = 42 } = {}) {
  number(bandwidth, 'Bandwidth', .01, 1000); number(delay, 'Delay'); number(jitter, 'Jitter'); number(loss, 'Loss', 0, 1); number(buffer, 'Buffer'); count(frames, 'Frames');
  const rng = random(seed), interval = 1000 / 30, qualities = [ .35, 1, 2.5, 5 ];
  let available = 0, estimate = 2.5, quality = 2;
  const timeline = [];
  for (let i = 0; i < frames; i++) {
    if (adaptive && i % 15 === 0) quality = Math.max(0, qualities.findLastIndex(rate => rate < estimate * .8));
    const sent = i * interval, bitrate = qualities[quality];
    const serialization = bitrate / 30 / bandwidth * 1000;
    const start = Math.max(sent, available); available = start + serialization;
    const arrival = available + Math.max(0, delay + (rng() * 2 - 1) * jitter);
    const lost = rng() < loss, deadline = sent + delay + buffer;
    const queue = start - sent;
    estimate = estimate * .85 + Math.min(bandwidth, bitrate * interval / Math.max(serialization, queue + serialization)) * .15;
    timeline.push({ frame: i, sent, arrival, deadline, bitrate, lost, late: !lost && arrival > deadline, played: !lost && arrival <= deadline });
  }
  return { frames, played: timeline.filter(f => f.played).length, lost: timeline.filter(f => f.lost).length, late: timeline.filter(f => f.late).length, mean_bitrate_mbps: mean(timeline.map(f => f.bitrate)), playback_delay_ms: delay + buffer, timeline };
}
