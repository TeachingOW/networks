import { random, mean, count } from '../../lib/common.js';
export class Cache {
  constructor(capacity = 3, policy = 'lru') {
    this.capacity = count(capacity, 'Cache capacity');
    if (!['lru', 'fifo'].includes(policy)) throw new Error('Unknown cache policy.');
    this.policy = policy; this.items = new Map();
  }
  get(key) {
    if (!this.items.has(key)) return false;
    if (this.policy === 'lru') { this.items.delete(key); this.items.set(key, true); }
    return true;
  }
  put(key) {
    if (this.items.has(key)) return;
    if (this.items.size >= this.capacity) this.items.delete(this.items.keys().next().value);
    this.items.set(key, true);
  }
}
export function workload(size = 200, seed = 42) {
  count(size, 'Request count'); const rng = random(seed);
  return Array.from({ length: size }, (_, i) => ({ client: i % 3, resource: `/asset-${rng() < .75 ? Math.floor(rng() * 3) : Math.floor(rng() * 12)}`, time: i * 10 }));
}
export function simulateCDN({ strategy = 'latency', policy = 'lru', capacity = 3, requests = workload(), seed = 42 } = {}) {
  if (!['direct', 'random', 'latency', 'round-robin', 'load-aware'].includes(strategy)) throw new Error('Unknown edge selection strategy.');
  if (!Array.isArray(requests) || !requests.length) throw new Error('Requests must be a nonempty array.');
  const rng = random(seed), caches = Array.from({ length: 3 }, () => new Cache(capacity, policy));
  const latencies = [[20, 80, 120], [90, 25, 70], [110, 75, 15]], available = [0, 0, 0];
  const originLatency = 160, timeline = [];
  let hits = 0;
  requests.forEach((request, i) => {
    const { client, resource, time } = request;
    if (!Number.isInteger(client) || client < 0 || client > 2 || typeof resource !== 'string' || !Number.isFinite(time) || time < 0 || (i && time < requests[i - 1].time)) throw new Error('Requests need a client 0–2, resource string, and nondecreasing nonnegative time.');
    if (strategy === 'direct') { timeline.push({ ...request, edge: 'origin', hit: false, response_ms: originLatency }); return; }
    const latency = latencies[client];
    const score = latency.map((n, e) => n + (strategy === 'load-aware' ? Math.max(0, available[e] - time) : 0));
    const edge = strategy === 'random' ? Math.floor(rng() * 3) : strategy === 'round-robin' ? i % 3 : score.indexOf(Math.min(...score));
    const hit = caches[edge].get(resource), wait = Math.max(0, available[edge] - time), service = hit ? 2 : 15;
    if (hit) hits++; else caches[edge].put(resource);
    // Cache fill is atomic in this educational model; origin latency is charged to misses.
    available[edge] = Math.max(time, available[edge]) + service;
    timeline.push({ ...request, edge: edge + 1, hit, response_ms: latency[edge] + wait + service + (hit ? 0 : originLatency) });
  });
  return { strategy, policy, requests: requests.length, hits, hit_ratio: hits / requests.length, mean_response_ms: mean(timeline.map(r => r.response_ms)), origin_requests: requests.length - hits, timeline };
}
export function compareCDN(options = {}) {
  return ['direct', 'random', 'latency', 'round-robin', 'load-aware'].flatMap(strategy => ['lru', 'fifo'].map(policy => simulateCDN({ ...options, strategy, policy })));
}
