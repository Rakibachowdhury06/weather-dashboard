const EXPECTED = ['date', 'precipitation', 'temp_max', 'temp_min', 'wind', 'weather'];

/**
 * Turns the CSV text into row objects. Throws a readable error if the file is not
 * what the dashboard expects, so the UI can show a message instead of broken charts.
 */
export function parseWeatherCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(',').map((h) => h.trim());
  if (EXPECTED.some((col, i) => header[i] !== col)) {
    throw new Error(`Unexpected CSV columns: ${header.join(', ')}`);
  }

  return lines.slice(1).map((line, i) => {
    const [date, precipitation, tempMax, tempMin, wind, weather] = line.split(',');
    const row = {
      date,
      year: Number(date.slice(0, 4)),
      month: Number(date.slice(5, 7)) - 1, // 0 = January
      ym: date.slice(0, 7),
      precipitation: Number(precipitation),
      tempMax: Number(tempMax),
      tempMin: Number(tempMin),
      wind: Number(wind),
      weather: weather.trim(),
    };
    const numbers = [row.year, row.month, row.precipitation, row.tempMax, row.tempMin, row.wind];
    if (numbers.some(Number.isNaN)) throw new Error(`Bad value on data row ${i + 1}: "${line}"`);
    return row;
  });
}

/** Turns row objects back into CSV text (used by the "Download CSV" button). */
export function rowsToCsv(rows) {
  const header = 'date,precipitation_mm,temp_max_c,temp_min_c,wind,weather';
  const body = rows.map((r) => [r.date, r.precipitation, r.tempMax, r.tempMin, r.wind, r.weather].join(','));
  return [header, ...body].join('\n');
}
