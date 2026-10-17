/** Maps a value from a data range onto a pixel range. */
export function linearScale([d0, d1], [r0, r1]) {
  const span = d1 - d0 || 1;
  return (v) => r0 + ((v - d0) / span) * (r1 - r0);
}

/** Rounds an axis range outward to "nice" numbers: 0, 50, 100 instead of 0, 47.3, 94.6. */
export function niceTicks(min, max, target = 5) {
  if (min === max) max = min + 1;
  const rawStep = (max - min) / Math.max(1, target);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / magnitude;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * magnitude;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks = [];
  for (let i = 0; start + i * step <= end + step / 2; i++) ticks.push(Number((start + i * step).toFixed(10)));
  return { ticks, min: ticks[0], max: ticks[ticks.length - 1] };
}
