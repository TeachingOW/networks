import { random, mean, number, count } from '../../lib/common.js';
export function simulateGame({ delay = 150, loss = .05, transport = 'udp', prediction = true, ticks = 300, seed = 42 } = {}) {
  number(delay, 'Delay'); number(loss, 'Loss', 0, 1); count(ticks, 'Ticks');
  if (!['tcp', 'udp'].includes(transport)) throw new Error('Transport must be tcp or udp.');
  const rng = random(seed), dt = 1000 / 30, speed = 3, queue = [], pending = [], timeline = [];
  let server = 0, client = 0, authoritative = 0, serverSeq = -1, clientSeq = -1, lost = 0, commandAvailable = 0, stateAvailable = 0;
  function send(type, payload, time) {
    const dropped = rng() < loss;
    if (dropped) lost++;
    if (dropped && transport === 'udp') return;
    let arrival = time + delay + (dropped ? 200 : 0);
    if (transport === 'tcp') {
      arrival = Math.max(arrival, type === 'input' ? commandAvailable : stateAvailable);
      if (type === 'input') commandAvailable = arrival; else stateAvailable = arrival;
    }
    queue.push({ type, payload, arrival });
  }
  for (let tick = 0; tick < ticks; tick++) {
    const now = tick * dt;
    // A two-player race is represented by one local player and an authoritative opponent.
    const direction = Math.floor(tick / 60) % 2 === 0 ? 1 : -1;
    const input = { sequence: tick, direction };
    pending.push(input);
    if (prediction) client += direction * speed;
    send('input', input, now);
    queue.sort((a, b) => a.arrival - b.arrival);
    while (queue.length && queue[0].arrival <= now) {
      const packet = queue.shift();
      if (packet.type === 'input' && packet.payload.sequence > serverSeq) {
        serverSeq = packet.payload.sequence; server += packet.payload.direction * speed;
        send('state', { sequence: serverSeq, position: server }, now);
      } else if (packet.type === 'state' && packet.payload.sequence > clientSeq) {
        clientSeq = packet.payload.sequence; authoritative = packet.payload.position;
        while (pending.length && pending[0].sequence <= clientSeq) pending.shift();
        client = authoritative + (prediction ? pending.reduce((sum, p) => sum + p.direction * speed, 0) : 0);
      }
      queue.sort((a, b) => a.arrival - b.arrival);
    }
    timeline.push({ tick, server, client, opponent: Math.sin(tick / 50) * 120, error: Math.abs(server - client), pending: pending.length });
  }
  return { transport, prediction, mean_error: mean(timeline.map(t => t.error)), dropped_packets: lost, final_server: server, final_client: client, timeline, note: 'Discrete in-memory transport; TCP loss is approximated by ordered delivery with a 200 ms retransmission delay. Prediction improves input response but can increase instantaneous distance from the delayed server.' };
}
