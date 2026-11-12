function ipNumber(ip) {
  if (typeof ip !== 'string' || !/^\d+\.\d+\.\d+\.\d+$/.test(ip)) throw new Error(`Invalid IPv4 address: ${ip}`);
  return ip.split('.').reduce((n, octet) => { if (+octet > 255) throw new Error('IPv4 octet exceeds 255.'); return ((n << 8) | +octet) >>> 0; }, 0);
}
export function inSubnet(ip, cidr) {
  const parts = cidr.split('/');
  if (parts.length !== 2 || !/^\d+$/.test(parts[1]) || +parts[1] > 32) throw new Error('Invalid CIDR prefix.');
  const mask = +parts[1] === 0 ? 0 : (0xffffffff << (32 - +parts[1])) >>> 0;
  return (ipNumber(ip) & mask) === (ipNumber(parts[0]) & mask);
}
export function topology() {
  return { dns: { 'server.lab': '192.168.3.10' }, hosts: {
    alice: { ip: '192.168.1.10', subnet: '192.168.1.0/24', gateway: 'r1' },
    bob: { ip: '192.168.2.10', subnet: '192.168.2.0/24', gateway: 'r2' },
    server: { ip: '192.168.3.10', subnet: '192.168.3.0/24', gateway: 'r3' }
  }, links: [['r1', 'r2'], ['r2', 'r3'], ['r1', 'r3']], routes: {
    r1: [{ subnet: '192.168.2.0/24', next: 'r2' }, { subnet: '192.168.3.0/24', next: 'r3' }],
    r2: [{ subnet: '192.168.1.0/24', next: 'r1' }, { subnet: '192.168.3.0/24', next: 'r3' }],
    r3: [{ subnet: '192.168.1.0/24', next: 'r1' }, { subnet: '192.168.2.0/24', next: 'r2' }]
  } };
}
export function trace(net, source, destination, ttl = 16) {
  const src = net.hosts[source];
  if (!src) throw new Error('Unknown source host.');
  const ip = net.dns[destination] ?? net.hosts[destination]?.ip ?? destination;
  try { ipNumber(ip); } catch { return { delivered: false, path: [source], reason: 'DNS resolution failed' }; }
  const target = Object.entries(net.hosts).find(([, h]) => h.ip === ip);
  if (!target) return { delivered: false, path: [source], reason: 'Destination host unavailable' };
  if (!inSubnet(src.ip, src.subnet)) return { delivered: false, path: [source], reason: 'Source address is outside its configured subnet' };
  if (inSubnet(ip, src.subnet)) return { delivered: true, path: [source, target[0]], reason: 'Local subnet delivery' };
  let router = src.gateway;
  const path = [source];
  for (let hop = 0; hop < ttl; hop++) {
    if (!router || !net.routes[router]) return { delivered: false, path, reason: 'Missing or invalid gateway' };
    if (path.includes(router)) return { delivered: false, path: [...path, router], reason: 'Routing loop' };
    path.push(router);
    if (router === target[1].gateway) return { delivered: true, path: [...path, target[0]], reason: 'Destination reached' };
    const route = net.routes[router].filter(r => inSubnet(ip, r.subnet)).sort((a, b) => +b.subnet.split('/')[1] - +a.subnet.split('/')[1])[0];
    if (!route) return { delivered: false, path, reason: 'No matching route' };
    if (!net.links.some(([a, b]) => a === router && b === route.next || b === router && a === route.next)) return { delivered: false, path, reason: `Link ${router} → ${route.next} unavailable` };
    router = route.next;
  }
  return { delivered: false, path, reason: 'TTL exceeded' };
}
export function ping(net, source, destination) {
  const forward = trace(net, source, destination);
  if (!forward.delivered) return { ...forward, direction: 'forward' };
  const reverse = trace(net, forward.path.at(-1), source);
  return { delivered: reverse.delivered, path: forward.path, returnPath: reverse.path, reason: reverse.delivered ? 'Request and reply delivered' : `Reply failed: ${reverse.reason}` };
}
