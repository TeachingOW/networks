import { count } from '../../lib/common.js';
export const training = [
  { dns: 'failure', tcp: 'not_completed', tls: 'not_completed', http: 'not_completed', label: 'DNS failure' },
  { dns: 'timeout', tcp: 'not_completed', tls: 'not_completed', http: 'not_completed', label: 'DNS failure' },
  { dns: 'success', tcp: 'timeout', tls: 'not_completed', http: 'not_completed', label: 'TCP failure' },
  { dns: 'success', tcp: 'refused', tls: 'not_completed', http: 'not_completed', label: 'TCP failure' },
  { dns: 'success', tcp: 'success', tls: 'connection_reset', http: 'not_completed', label: 'TLS failure' },
  { dns: 'success', tcp: 'success', tls: 'certificate_error', http: 'not_completed', label: 'TLS failure' },
  { dns: 'success', tcp: 'success', tls: 'success', http: 503, label: 'HTTP failure' },
  { dns: 'success', tcp: 'success', tls: 'success', http: 404, label: 'HTTP failure' },
  { dns: 'success', tcp: 'success', tls: 'success', http: 200, label: 'Healthy' },
  { dns: 'success', tcp: 'success', tls: 'success', http: 204, label: 'Healthy' }
];
const fields = ['dns', 'tcp', 'tls', 'http'];
const feature = (row, key) => key === 'http' && Number.isFinite(+row[key]) ? `${Math.floor(+row[key] / 100)}xx` : String(row[key] ?? 'unknown');
export function classify(row, examples = training) {
  if (!examples.length) throw new Error('Training examples are required.');
  const labels = [...new Set(examples.map(r => r.label))];
  const scores = labels.map(label => {
    const group = examples.filter(r => r.label === label);
    let logScore = Math.log(group.length / examples.length);
    for (const key of fields) {
      const vocabulary = new Set(examples.map(r => feature(r, key)));
      const matches = group.filter(r => feature(r, key) === feature(row, key)).length;
      logScore += Math.log((matches + 1) / (group.length + vocabulary.size + 1));
    }
    return { label, logScore };
  }).sort((a, b) => b.logScore - a.logScore);
  const denominator = scores.reduce((sum, s) => sum + Math.exp(s.logScore - scores[0].logScore), 0);
  return { label: scores[0].label, score: 1 / denominator, note: 'Naive Bayes model score; not a calibrated root-cause probability.' };
}
export function diagnoseLog(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Each incident must be an object.');
  const evidence = fields.filter(k => row[k] !== undefined).map(k => `${k.toUpperCase()}: ${row[k]}`);
  let diagnosis = 'Insufficient evidence', nextTest = 'Collect DNS, TCP, TLS and HTTP measurements';
  for (const key of ['dns', 'tcp', 'tls']) {
    if (row[key] && !['success', 'not_completed', 'unknown'].includes(row[key])) {
      diagnosis = `${key.toUpperCase()} failure`;
      nextTest = { dns: 'Query another resolver and compare answers', tcp: 'Check destination reachability and listening port', tls: 'Inspect certificate and repeat the TLS handshake from another network' }[key];
      break;
    }
  }
  if (diagnosis === 'Insufficient evidence' && Number.isFinite(+row.http) && +row.http >= 400) { diagnosis = 'HTTP failure'; nextTest = 'Inspect HTTP status, response headers and server logs'; }
  if (diagnosis === 'Insufficient evidence' && +row.http >= 200 && +row.http < 400) { diagnosis = 'Healthy'; nextTest = 'Compare timings with the performance baseline'; }
  if (diagnosis === 'Healthy' && +row.latency_ms > 200) diagnosis = 'Performance degradation';
  return { incident_id: row.incident_id ?? 'unknown', diagnosis, evidence, nextTest, cause: 'Not conclusively determined by these observations', model: classify(row) };
}
export function parseLogs(text) {
  const data = JSON.parse(text);
  if (data?.log?.entries) return data.log.entries.map((e, i) => ({ incident_id: i + 1, http: e.response?.status || 'unknown', latency_ms: e.time, url: e.request?.url }));
  const rows = Array.isArray(data) ? data : [data];
  count(rows.length, 'Incident count');
  return rows;
}
export function evaluate(rows) {
  const labeled = rows.filter(r => r.label);
  if (!labeled.length) throw new Error('Evaluation requires labeled incidents.');
  const confusion = {};
  let correct = 0;
  for (const row of labeled) {
    const prediction = classify(row).label;
    if (prediction === row.label) correct++;
    const key = `${row.label} → ${prediction}`; confusion[key] = (confusion[key] ?? 0) + 1;
  }
  return { total: labeled.length, correct, accuracy: correct / labeled.length, confusion };
}
