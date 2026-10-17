import { MONTHS, round1 } from './format.js';

/** Keeps the days that match the year and weather-type filters ('all' means no filter). */
export function filterRows(rows, { year = 'all', weather = 'all' }) {
  return rows.filter(
    (r) => (year === 'all' || r.year === Number(year)) && (weather === 'all' || r.weather === weather)
  );
}

export const uniqueYears = (rows) => [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
export const uniqueWeather = (rows) => [...new Set(rows.map((r) => r.weather))].sort();

/**
 * One entry per calendar month in the selected years, even months with no matching days
 * (those get null values, so the chart shows a gap instead of a fake zero).
 */
export function monthlyStats(rows, years) {
  const buckets = new Map();
  for (const year of years) {
    for (let m = 0; m < 12; m++) {
      const ym = `${year}-${String(m + 1).padStart(2, '0')}`;
      buckets.set(ym, { ym, year, month: m, label: `${MONTHS[m]} ${year}`, days: 0, high: 0, low: 0, precip: 0 });
    }
  }
  for (const r of rows) {
    const b = buckets.get(r.ym);
    if (!b) continue;
    b.days += 1;
    b.high += r.tempMax;
    b.low += r.tempMin;
    b.precip += r.precipitation;
  }
  return [...buckets.values()].map((b) => ({
    ym: b.ym,
    year: b.year,
    month: b.month,
    label: b.label,
    days: b.days,
    avgHigh: b.days ? b.high / b.days : null,
    avgLow: b.days ? b.low / b.days : null,
    precip: b.days ? round1(b.precip) : null,
  }));
}

/** How many days of each weather type, most common first. */
export function weatherCounts(rows) {
  const counts = {};
  for (const r of rows) counts[r.weather] = (counts[r.weather] ?? 0) + 1;
  return Object.entries(counts)
    .map(([weather, days]) => ({ weather, days, share: rows.length ? days / rows.length : 0 }))
    .sort((a, b) => b.days - a.days || a.weather.localeCompare(b.weather));
}

/** The headline numbers for the stat tiles. */
export function kpis(rows) {
  if (rows.length === 0) {
    return { days: 0, avgHigh: null, totalPrecip: null, wetDays: 0, wetShare: null, hottest: null };
  }
  const wetDays = rows.filter((r) => r.precipitation > 0).length;
  return {
    days: rows.length,
    avgHigh: rows.reduce((s, r) => s + r.tempMax, 0) / rows.length,
    totalPrecip: rows.reduce((s, r) => s + r.precipitation, 0),
    wetDays,
    wetShare: wetDays / rows.length,
    hottest: rows.reduce((best, r) => (r.tempMax > best.tempMax ? r : best)),
  };
}
