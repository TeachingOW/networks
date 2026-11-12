import { diagnose, generate } from '../projects/network-detective/index.js';
import { topology, ping } from '../projects/mini-internet/index.js';
import { simulateVideo } from '../projects/video-call/index.js';
import { diagnoseLog, parseLogs, evaluate } from '../projects/ai-network-admin/index.js';
import { simulateGame } from '../projects/multiplayer/index.js';
import { simulateCDN, compareCDN } from '../projects/mini-cdn/index.js';
const $ = id => document.getElementById(id);
const sample = [{ incident_id: 101, dns: 'success', tcp: 'success', tls: 'connection_reset', http: 'not_completed', label: 'TLS failure' }, { incident_id: 102, dns: 'timeout', tcp: 'not_completed', tls: 'not_completed', http: 'not_completed', label: 'DNS failure' }];
const labs = {
  detective: { title: 'Network Detective', description: 'Follow the evidence. Measure round-trip time, throughput and packet loss to uncover a degraded connection.', guide: 'Compare healthy, congestion, loss and jitter scenarios. Explain which measurements support a hypothesis and which additional measurements would distinguish competing causes.', fields: [['scenario', 'Scenario', ['healthy', 'congestion', 'loss', 'jitter']], ['seed', 'Random seed', 42]], run: o => {
    const samples = generate(o), result = diagnose(samples);
    return { result: { ...result, samples }, metrics: [[result.latency_ms.toFixed(1) + ' ms', 'Mean RTT'], [(result.packet_loss * 100).toFixed(1) + '%', 'Packet loss'], [result.status, 'Diagnosis']], series: [samples.map(s => s.latency_ms)], note: 'Round-trip time (ms) / sample' };
  } },
  internet: { title: 'Build a Mini Internet', description: 'Configure three subnets, resolve a name, and follow the request and reply through a routed network.', guide: 'Remove the r1–r3 link, observe failure, then change r1’s route to use r2. Verify the return route too. Try a missing gateway, DNS typo or broader /0 route. The JSON editor exposes the addressing table, DNS, links and routing configuration.', fields: [['source', 'Source host', ['alice', 'bob', 'server']], ['destination', 'Destination name or host', 'server.lab'], ['network', 'Editable topology (JSON)', JSON.stringify(topology(), null, 2), 'textarea']], run: o => {
    const result = ping(JSON.parse(o.network), o.source, o.destination);
    return { result, metrics: [[result.delivered ? 'Delivered' : 'Failed', 'Connectivity'], [Math.max(0, result.path.length - 1), 'Forward hops'], [result.returnPath ? result.returnPath.length - 1 : '—', 'Return hops']], series: [], note: result.path.join(' → ') };
  } },
  video: { title: 'Video Call Under Bad Networks', description: 'Send generated frames across a constrained link. Explore queueing, jitter buffers and adaptive quality.', guide: 'Try 20 Mbps / 20 ms / 0% loss, then 1 Mbps / 200 ms / 5% loss. Compare adaptation on and off. Increasing the buffer trades playback delay for fewer late frames. Each generated frame is one simulated datagram; this model does not run WebRTC.', fields: [['bandwidth', 'Bandwidth (Mbps)', 5], ['delay', 'One-way delay (ms)', 80], ['jitter', 'Jitter amplitude (ms)', 20], ['lossPercent', 'Packet loss (%)', 1], ['buffer', 'Jitter buffer (ms)', 120], ['adaptive', 'Adaptive bitrate', true]], run: o => {
    const result = simulateVideo({ ...o, loss: o.lossPercent / 100 });
    return { result, metrics: [[result.played + '/' + result.frames, 'Frames played'], [result.late, 'Late frames'], [result.mean_bitrate_mbps.toFixed(2) + ' Mbps', 'Average quality']], series: [result.timeline.map(f => f.bitrate)], note: 'Selected frame bitrate (Mbps) / frame. Below: generated sender and receiver frames.', animate: 'video' };
  } },
  admin: { title: 'AI Network Administrator', description: 'Inspect measured evidence, compare rule-based diagnoses with a trained classifier, and plan the next diagnostic test.', guide: 'Paste a JSON incident array or a Chrome HAR export. HAR status and total time are preserved; unobserved DNS/TCP/TLS outcomes stay unknown. Optional label fields enable evaluation. The small categorical Naive Bayes model is a teaching baseline, not a production diagnosis service.', fields: [['logs', 'JSON incidents or HAR export', JSON.stringify(sample, null, 2), 'textarea']], run: o => {
    const rows = parseLogs(o.logs), reports = rows.map(diagnoseLog);
    const result = { reports, ...(rows.some(r => r.label) ? { evaluation: evaluate(rows) } : {}) };
    return { result, metrics: [[reports.length, 'Incidents'], [reports.filter(r => r.diagnosis.includes('failure')).length, 'Observed failures'], [result.evaluation ? (result.evaluation.accuracy * 100).toFixed(0) + '%' : '—', 'Classifier accuracy']], series: [], note: 'Observed failure and hypothesized cause are reported separately.' };
  } },
  vpn: { title: 'Build a Mini VPN', description: 'A Java tunnel with AES-GCM authenticated encryption, directional session keys and a sliding replay window.', guide: 'Open projects/mini-vpn/src. Compile all four Java files, then run Main. For an online Java environment, add Packet.java, VPNClient.java and VPNNetwork.java alongside Main.java. Compare ciphertext tampering, header tampering, duplicate packets and reordered packets. Fresh keys are generated each run; key exchange is outside the model.', fields: [], run: () => ({ result: { command: 'npm run test:java', manual: 'javac -d build/java projects/mini-vpn/src/*.java && java -cp build/java Main', source: ['projects/mini-vpn/src/Main.java', 'projects/mini-vpn/src/Packet.java', 'projects/mini-vpn/src/VPNClient.java', 'projects/mini-vpn/src/VPNNetwork.java'], algorithm: 'AES-256-GCM with 128-bit authentication tags', nonce: '96-bit counter nonce; unique within a directional single-session key', replay: '64-packet authenticated sliding window', scope: 'Java program; run locally with JDK 17+ or in an online Java compiler. The browser does not execute Java.' }, metrics: [['AES-GCM', 'Authenticated encryption'], ['64', 'Replay window'], ['Java 17+', 'Runtime']], series: [], note: 'Run the Java demo to execute the security checks. These values describe the implementation, not a browser test run.' }) },
  game: { title: 'Multiplayer Game Networking', description: 'Compare a local predicted player with authoritative server state over a simulated unreliable or ordered channel.', guide: 'Try 0, 50, 150 and 300 ms delay with 0% and 5% loss. Compare UDP and TCP approximations, then enable prediction. The client immediately applies input and replays unacknowledged commands after each authoritative snapshot. Lower response delay does not necessarily mean lower instantaneous position error.', fields: [['delay', 'One-way delay (ms)', 150], ['lossPercent', 'Packet loss (%)', 5], ['transport', 'Transport model', ['udp', 'tcp']], ['prediction', 'Client prediction', true]], run: o => {
    const result = simulateGame({ ...o, loss: o.lossPercent / 100 });
    return { result, metrics: [[result.mean_error.toFixed(1), 'Mean position error'], [result.dropped_packets, 'Loss events'], [result.prediction ? 'Enabled' : 'Disabled', 'Prediction']], series: [result.timeline.map(t => t.server), result.timeline.map(t => t.client)], note: 'Server (green) and local client (orange) positions / tick. Animated race below.', animate: 'game' };
  } },
  cdn: { title: 'Mini Content Delivery Network', description: 'Route a reproducible request workload through three edge caches. Compare hit ratios, queueing and response times.', guide: 'Compare all five routing strategies using the same seeded workload. Compare LRU and FIFO at capacities 1, 3 and 8. Requests arrive every 10 ms; edge workers queue cache service, while origin fetch latency is charged to misses. Cache fills are atomic: simultaneous miss coalescing and asynchronous fill timing are outside this model.', fields: [['strategy', 'Edge selection', ['latency', 'direct', 'random', 'round-robin', 'load-aware']], ['policy', 'Cache policy', ['lru', 'fifo']], ['capacity', 'Cache capacity (objects)', 3]], run: o => {
    const result = simulateCDN(o), comparison = compareCDN({ capacity: o.capacity });
    return { result: { ...result, comparison: comparison.map(({ timeline, ...summary }) => summary) }, metrics: [[(result.hit_ratio * 100).toFixed(1) + '%', 'Cache hit ratio'], [result.mean_response_ms.toFixed(1) + ' ms', 'Mean response'], [result.origin_requests, 'Origin requests']], series: [result.timeline.map(r => r.response_ms)], note: 'Response time (ms) / request. Export includes all ten strategy/policy comparisons.' };
  } }
};
let lastResult, animation;
function draw(series) {
  const canvas = $('chart'), ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#e3eadd'; ctx.lineWidth = 1;
  for (let y = 30; y < h; y += 50) { ctx.beginPath(); ctx.moveTo(45, y); ctx.lineTo(w - 15, y); ctx.stroke(); }
  if (!series.length) { ctx.fillStyle = '#6d8579'; ctx.font = '16px sans-serif'; ctx.fillText('Run an experiment · inspect the report below', 40, 120); return; }
  const values = series.flat(), low = Math.min(0, ...values), high = Math.max(1, ...values), colors = ['#28795c', '#d99743'];
  ctx.fillStyle = '#6d8579'; ctx.font = '12px monospace'; ctx.fillText(high.toFixed(1), 4, 25); ctx.fillText(low.toFixed(1), 4, h - 8);
  series.forEach((points, index) => { ctx.strokeStyle = colors[index % colors.length]; ctx.lineWidth = 2.5; ctx.beginPath(); points.forEach((v, i) => { const x = 45 + i / Math.max(1, points.length - 1) * (w - 60), y = h - 20 - (v - low) / (high - low) * (h - 50); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.stroke(); });
}
function animate(kind, result) {
  const extra = document.createElement('canvas'); extra.width = 900; extra.height = 160; extra.setAttribute('aria-label', kind === 'video' ? 'Generated sender and receiver frames' : 'Simulated race positions'); extra.setAttribute('role', 'img');
  extra.id = 'animation'; $('chart-note').after(extra);
  const ctx = extra.getContext('2d'); let start;
  function frame(time) {
    start ??= time; const tick = Math.floor((time - start) / (1000 / 30)) % result.timeline.length, row = result.timeline[tick];
    ctx.clearRect(0, 0, 900, 160); ctx.font = '16px monospace';
    if (kind === 'video') {
      for (const [index, label, playing] of [[0, 'SENDER', true], [1, 'RECEIVER', row.played]]) {
        const x = 30 + index * 450; ctx.fillStyle = playing ? '#d9efca' : '#e7dfd6'; ctx.fillRect(x, 10, 390, 140);
        ctx.fillStyle = '#1e5e4d'; ctx.fillText(`${label} / FRAME ${tick}`, x + 15, 37);
        if (playing) { ctx.beginPath(); ctx.arc(x + 35 + tick % 100 * 3, 95, 20, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillText(row.lost ? 'PACKET LOST' : 'FRAME LATE', x + 100, 95);
      }
    } else {
      for (const [i, name, value, color] of [[0, 'SERVER', row.server, '#28795c'], [1, 'CLIENT', row.client, '#d99743'], [2, 'OPPONENT', row.opponent, '#75869b']]) {
        const y = 22 + i * 48; ctx.fillStyle = '#5d7569'; ctx.fillText(name, 10, y + 16); ctx.fillStyle = color; ctx.fillRect(470 + value * 1.7, y, 26, 23);
      }
    }
    animation = requestAnimationFrame(frame);
  }
  animation = requestAnimationFrame(frame);
}
function mount() {
  cancelAnimationFrame(animation); document.getElementById('animation')?.remove();
  const key = location.hash.slice(1) in labs ? location.hash.slice(1) : 'detective', lab = labs[key];
  $('title').textContent = lab.title; $('description').textContent = lab.description; $('guide').textContent = lab.guide;
  for (const link of $('nav').children) link.classList.toggle('active', link.hash === '#' + key);
  $('controls').replaceChildren();
  for (const [name, labelText, initial, type] of lab.fields) {
    const label = document.createElement('label'); label.textContent = labelText;
    const input = document.createElement(Array.isArray(initial) ? 'select' : type === 'textarea' ? 'textarea' : 'input'); input.name = name;
    if (Array.isArray(initial)) for (const value of initial) { const option = document.createElement('option'); option.value = value; option.textContent = value; input.append(option); }
    else if (typeof initial === 'boolean') { input.type = 'checkbox'; input.checked = initial; }
    else { if (input.tagName === 'INPUT') { input.type = typeof initial === 'number' ? 'number' : 'text'; if (input.type === 'number') { input.step = 'any'; input.min = '0'; } } input.value = initial; }
    label.append(input); $('controls').append(label);
  }
  const button = document.createElement('button'); button.textContent = key === 'vpn' ? 'Show run instructions →' : 'Run experiment →'; $('controls').append(button);
  const run = () => {
    try {
      cancelAnimationFrame(animation); document.getElementById('animation')?.remove();
      const options = {};
      for (const [name, , initial] of lab.fields) { const input = $('controls').elements.namedItem(name); options[name] = typeof initial === 'boolean' ? input.checked : typeof initial === 'number' ? Number(input.value) : input.value; }
      const view = lab.run(options); lastResult = { project: key, options, ...view.result };
      $('error').textContent = ''; $('metrics').replaceChildren();
      for (const [value, label] of view.metrics) { const div = document.createElement('div'); div.className = 'metric'; const strong = document.createElement('strong'), span = document.createElement('span'); strong.textContent = value; span.textContent = label; div.append(strong, span); $('metrics').append(div); }
      const { timeline, samples, ...summary } = view.result; $('output').textContent = JSON.stringify(summary, null, 2);
      draw(view.series); $('chart-note').textContent = view.note;
      if (view.animate) animate(view.animate, view.result);
    } catch (error) { lastResult = null; $('error').textContent = error.message; $('metrics').replaceChildren(); $('output').textContent = ''; draw([]); $('chart-note').textContent = ''; }
  };
  $('controls').onsubmit = event => { event.preventDefault(); run(); }; run();
}
Object.entries(labs).forEach(([key, lab], i) => { const link = document.createElement('a'), num = document.createElement('span'); link.href = '#' + key; num.textContent = String(i + 1).padStart(2, '0'); link.append(num, document.createTextNode(lab.title)); $('nav').append(link); });
$('export').onclick = () => { if (!lastResult) return; const url = URL.createObjectURL(new Blob([JSON.stringify(lastResult, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `${lastResult.project}-experiment.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
window.addEventListener('hashchange', mount); mount();
