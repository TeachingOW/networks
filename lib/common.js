export function random(seed = 42) {
  let state = seed >>> 0;
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
}
export const mean = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
export function number(value, name, min = 0, max = Infinity) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${name} must be between ${min} and ${max}.`);
  return n;
}
export function count(value, name, min = 1, max = 10000) {
  const n = number(value, name, min, max);
  if (!Number.isInteger(n)) throw new Error(`${name} must be an integer.`);
  return n;
}
