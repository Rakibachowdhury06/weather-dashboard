import { describe, it, expect } from 'vitest';
import { parseWeatherCsv, rowsToCsv } from './csv.js';
import { filterRows, monthlyStats, weatherCounts, kpis, uniqueYears } from './aggregate.js';
import { niceTicks, linearScale } from './scale.js';
import { formatDate } from './format.js';

const csv = `date,precipitation,temp_max,temp_min,wind,weather
2012-01-01,0.0,10.0,2.0,4.7,sun
2012-01-02,10.0,8.0,4.0,4.5,rain
2012-02-01,0.0,12.0,6.0,3.0,sun
2013-01-01,5.0,6.0,0.0,2.0,snow`;
const rows = parseWeatherCsv(csv);

describe('parseWeatherCsv', () => {
  it('reads rows with numbers and date parts', () => {
    expect(rows).toHaveLength(4);
    expect(rows[1]).toMatchObject({ date: '2012-01-02', year: 2012, month: 0, ym: '2012-01', precipitation: 10, tempMax: 8, weather: 'rain' });
  });
  it('rejects a file with the wrong columns', () => {
    expect(() => parseWeatherCsv('a,b,c\n1,2,3')).toThrow(/Unexpected CSV columns/);
  });
  it('rejects a row with a non-numeric value', () => {
    expect(() => parseWeatherCsv(csv + '\n2013-01-02,abc,1,1,1,sun')).toThrow(/Bad value/);
  });
  it('round-trips through rowsToCsv', () => {
    expect(parseWeatherCsv(rowsToCsv(rows).replace('precipitation_mm,temp_max_c,temp_min_c', 'precipitation,temp_max,temp_min'))).toEqual(rows);
  });
});

describe('filterRows', () => {
  it('filters by year and weather together', () => {
    expect(filterRows(rows, { year: '2012', weather: 'sun' })).toHaveLength(2);
    expect(filterRows(rows, { year: 'all', weather: 'snow' })).toHaveLength(1);
    expect(filterRows(rows, { year: 'all', weather: 'all' })).toHaveLength(4);
  });
  it('lists the years in order', () => {
    expect(uniqueYears(rows)).toEqual([2012, 2013]);
  });
});

describe('monthlyStats', () => {
  const stats = monthlyStats(rows, [2012]);
  it('returns 12 months and averages the days in each', () => {
    expect(stats).toHaveLength(12);
    expect(stats[0]).toMatchObject({ days: 2, avgHigh: 9, avgLow: 3, precip: 10 });
  });
  it('uses null (a gap), not zero, for months with no days', () => {
    expect(stats[5].avgHigh).toBeNull();
    expect(stats[5].precip).toBeNull();
  });
});

describe('weatherCounts and kpis', () => {
  it('counts weather types, most common first', () => {
    expect(weatherCounts(rows)[0]).toMatchObject({ weather: 'sun', days: 2, share: 0.5 });
  });
  it('computes the headline numbers', () => {
    const k = kpis(rows);
    expect(k).toMatchObject({ days: 4, wetDays: 2, wetShare: 0.5, totalPrecip: 15 });
    expect(k.avgHigh).toBe(9);
    expect(k.hottest.date).toBe('2012-02-01');
  });
  it('handles an empty selection', () => {
    expect(kpis([])).toMatchObject({ days: 0, avgHigh: null, hottest: null });
  });
});

describe('scales and formatting', () => {
  it('picks round tick values', () => {
    const { ticks, min, max } = niceTicks(0, 47.3, 5);
    expect(ticks).toEqual([0, 10, 20, 30, 40, 50]);
    expect([min, max]).toEqual([0, 50]);
  });
  it('handles negative ranges', () => {
    expect(niceTicks(-1.6, 35).ticks[0]).toBeLessThanOrEqual(-1.6);
  });
  it('maps values to pixels', () => {
    expect(linearScale([0, 10], [100, 200])(5)).toBe(150);
  });
  it('formats dates without time-zone shifts', () => {
    expect(formatDate('2013-07-04')).toBe('Jul 4, 2013');
  });
});
