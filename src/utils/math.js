export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

export function damp(current, target, lambda, deltaTime) {
  return lerp(current, target, 1 - Math.exp(-lambda * deltaTime));
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function map(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function smoothstep(min, max, value) {
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

export function hash(x, y, z = 0) {
  let h = x * 374761393 + y * 668265263 + z * 2115324233;
  h = (h ^ (h >>> 13)) * 1274126177;
  return (h ^ (h >>> 16)) / 4294967296 + 0.5;
}

export function noise2D(x, y) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  
  x -= Math.floor(x);
  y -= Math.floor(y);
  
  const u = fade(x);
  const v = fade(y);
  
  const A = p[X] + Y;
  const B = p[X + 1] + Y;
  
  return lerp(v, 
    lerp(u, grad(p[A], x, y), grad(p[B], x - 1, y)),
    lerp(u, grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1))
  );
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash, x, y) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : (h === 12 || h === 14 ? x : 0);
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// Permutation table for noise
const p = [];
for (let i = 0; i < 256; i++) p[i] = i;
for (let i = 255; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [p[i], p[j]] = [p[j], p[i]];
}
for (let i = 0; i < 256; i++) p[256 + i] = p[i];