import { useMemo, useState } from 'react';
import useWeatherData from './hooks/useWeatherData.js';
import useTheme from './hooks/useTheme.js';
import FilterBar from './components/FilterBar.jsx';
import StatTile from './components/StatTile.jsx';
import LineChart from './components/LineChart.jsx';
import ColumnChart from './components/ColumnChart.jsx';
import BarList from './components/BarList.jsx';
import DataTables from './components/DataTables.jsx';
import { filterRows, kpis, monthlyStats, uniqueWeather, uniqueYears, weatherCounts } from './utils/aggregate.js';
import { rowsToCsv } from './utils/csv.js';
import { MONTHS, capitalize, fmt0, fmt1, formatDate } from './utils/format.js';

const DEFAULT_FILTERS = { year: 'all', weather: 'all' };

/** "▲ 0.4 °C vs 2013". Direction only, no good/bad colour: warmer or wetter is not simply better. */
function deltaText(current, previous, unit, previousYear, digits = 1) {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '■';
  const shown = Math.abs(diff).toLocaleString('en-CA', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return `${arrow} ${diff > 0 ? '+' : diff < 0 ? '−' : ''}${shown} ${unit} vs ${previousYear}`;
}

function downloadCsv(rows, filters) {
  const blob = new Blob([rowsToCsv(rows)], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `seattle-weather-${filters.year}-${filters.weather}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const { status, rows, error, reload } = useWeatherData();
  const [theme, toggleTheme] = useTheme();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState('charts');

  const allYears = useMemo(() => uniqueYears(rows), [rows]);
  const weatherTypes = useMemo(() => uniqueWeather(rows), [rows]);

  // Everything below is derived from the raw rows + the current filters.
  const model = useMemo(() => {
    if (rows.length === 0) return null;
    const filtered = filterRows(rows, filters);
    const years = filters.year === 'all' ? allYears : [Number(filters.year)];
    const monthly = monthlyStats(filtered, years);
    const previousYear = filters.year === 'all' ? null : Number(filters.year) - 1;
    const previous = previousYear && allYears.includes(previousYear)
      ? kpis(filterRows(rows, { year: previousYear, weather: filters.weather }))
      : null;
    return {
      filtered,
      monthly,
      stats: kpis(filtered),
      previous: previous?.days ? { ...previous, year: previousYear } : null,
      // The weather-type chart ignores the weather filter so every type stays visible; the selected one is highlighted.
      weather: weatherCounts(filterRows(rows, { year: filters.year, weather: 'all' })),
    };
  }, [rows, filters, allYears]);

  const header = (
    <header className="page-header">
      <div>
        <h1>Seattle Weather Dashboard</h1>
        <p className="muted">Daily observations at Seattle, 2012–2015. Explore temperature, rain and weather types.</p>
      </div>
      <button type="button" className="btn ghost" onClick={toggleTheme} aria-pressed={theme === 'dark'}>
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
    </header>
  );

  const footer = (
    <footer className="page-footer">
      <p>
        Data: NOAA daily weather summaries for Seattle, from the open-source <code>vega-datasets</code> package (U.S. government
        data). The weather type is a label derived from the original measurements and the dataset is meant for teaching.
      </p>
      <p>Built with React by Rakiba Chowdhury. Charts are hand-drawn SVG, with no chart library.</p>
    </footer>
  );

  if (status === 'loading') {
    return <div className="page">{header}<p role="status" className="panel">Loading data…</p>{footer}</div>;
  }
  if (status === 'error') {
    return (
      <div className="page">
        {header}
        <div className="panel" role="alert">
          <p><strong>The data could not be loaded.</strong></p>
          <p className="muted">{error}</p>
          <button type="button" className="btn" onClick={reload}>Try again</button>
        </div>
        {footer}
      </div>
    );
  }

  const { filtered, monthly, stats, previous, weather } = model;
  const singleYear = filters.year !== 'all';

  const linePoints = monthly.map((m) => ({
    label: m.label,
    tick: singleYear ? MONTHS[m.month] : m.month === 0 ? String(m.year) : m.month === 6 ? 'Jul' : '',
    values: { high: m.avgHigh, low: m.avgLow },
  }));
  const columnPoints = monthly.map((m, i) => ({ label: m.label, tick: linePoints[i].tick, value: m.precip }));
  const weatherRows = weather.map((w) => ({
    key: w.weather,
    label: capitalize(w.weather),
    value: w.days,
    text: `${fmt0(w.days)} · ${fmt0(w.share * 100)}%`,
    detail: 'days',
    highlighted: filters.weather === w.weather,
  }));

  return (
    <div className="page">
      {header}
      <FilterBar
        years={allYears}
        weatherTypes={weatherTypes}
        filters={filters}
        onChange={setFilters}
        view={view}
        onViewChange={setView}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        dayCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="panel" role="status">
          <p><strong>No days match these filters.</strong></p>
          <p className="muted">Try a different year or weather type.</p>
          <button type="button" className="btn" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button>
        </div>
      ) : (
        <>
          <section className="tiles" aria-label="Key numbers">
            <StatTile
              label="Average daily high"
              value={fmt1(stats.avgHigh)}
              unit="°C"
              delta={previous && deltaText(stats.avgHigh, previous.avgHigh, '°C', previous.year)}
            />
            <StatTile
              label="Total precipitation"
              value={fmt0(stats.totalPrecip)}
              unit="mm"
              delta={previous && deltaText(stats.totalPrecip, previous.totalPrecip, 'mm', previous.year, 0)}
            />
            <StatTile label="Days with precipitation" value={fmt0(stats.wetDays)} sub={`${fmt0(stats.wetShare * 100)}% of selected days`} />
            <StatTile label="Hottest day" value={fmt1(stats.hottest.tempMax)} unit="°C" sub={formatDate(stats.hottest.date)} />
          </section>

          {view === 'charts' ? (
            <div className="charts">
              <section className="card wide">
                <h2>Temperature by month</h2>
                <p className="muted">Average daily high and low, °C</p>
                <LineChart
                  points={linePoints}
                  series={[
                    { key: 'high', name: 'High', color: 'var(--series-2)' },
                    { key: 'low', name: 'Low', color: 'var(--series-1)' },
                  ]}
                  format={(v) => `${fmt1(v)} °C`}
                  ariaLabel="Line chart of average daily high and low temperature by month. Use the arrow keys to move between months."
                />
              </section>

              <section className="card">
                <h2>Precipitation by month</h2>
                <p className="muted">Total millimetres per month</p>
                <ColumnChart
                  points={columnPoints}
                  color="var(--series-1)"
                  seriesName="Precipitation"
                  format={(v) => `${fmt0(v)} mm`}
                  ariaLabel="Column chart of total precipitation by month. Use the arrow keys to move between months."
                />
              </section>

              <section className="card">
                <h2>Days by weather type</h2>
                <p className="muted">
                  {filters.weather === 'all' ? 'Number and share of days' : `Showing all types; ${capitalize(filters.weather)} highlighted`}
                </p>
                <BarList rows={weatherRows} color="var(--series-1)" />
              </section>
            </div>
          ) : (
            <>
              <DataTables monthly={monthly} weather={weather} />
              <p>
                <button type="button" className="btn" onClick={() => downloadCsv(filtered, filters)}>
                  Download the {filtered.length.toLocaleString('en-CA')} selected days (CSV)
                </button>
              </p>
            </>
          )}
        </>
      )}
      {footer}
    </div>
  );
}
