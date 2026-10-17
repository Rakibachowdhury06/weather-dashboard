import { capitalize } from '../utils/format.js';

/** One row above the charts. Whatever is chosen here scopes every tile, chart and table below. */
export default function FilterBar({ years, weatherTypes, filters, onChange, view, onViewChange, onReset, dayCount }) {
  const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value });
  const isFiltered = filters.year !== 'all' || filters.weather !== 'all';

  return (
    <div className="filters" role="region" aria-label="Filters">
      <label>
        Year
        <select value={filters.year} onChange={set('year')}>
          <option value="all">All years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      <label>
        Weather type
        <select value={filters.weather} onChange={set('weather')}>
          <option value="all">All types</option>
          {weatherTypes.map((w) => <option key={w} value={w}>{capitalize(w)}</option>)}
        </select>
      </label>
      <button type="button" className="btn ghost" onClick={onReset} disabled={!isFiltered}>Reset</button>

      <p className="filters-count" aria-live="polite">{dayCount.toLocaleString('en-CA')} days selected</p>

      <div className="segmented" role="group" aria-label="View">
        {['charts', 'table'].map((v) => (
          <button key={v} type="button" aria-pressed={view === v} onClick={() => onViewChange(v)}>
            {capitalize(v)}
          </button>
        ))}
      </div>
    </div>
  );
}
