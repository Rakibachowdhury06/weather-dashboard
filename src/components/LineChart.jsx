import useElementWidth from '../hooks/useElementWidth.js';
import useActiveIndex from '../hooks/useActiveIndex.js';
import { linearScale, niceTicks } from '../utils/scale.js';
import Tooltip from './Tooltip.jsx';

const M = { top: 14, right: 48, bottom: 28, left: 40 };

/** Builds an SVG path that lifts the pen at missing values, so gaps stay gaps. */
function linePath(points, key, x, y) {
  let d = '';
  let penDown = false;
  points.forEach((p, i) => {
    const v = p.values[key];
    if (v == null) {
      penDown = false;
      return;
    }
    d += `${penDown ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    penDown = true;
  });
  return d;
}

/**
 * Multi-series line chart drawn with plain SVG.
 * points: [{ label, tick, values: { [seriesKey]: number | null } }]
 * series: [{ key, name, color }]
 */
export default function LineChart({ points, series, format, height = 280, ariaLabel }) {
  const [ref, width] = useElementWidth();
  const { index, setActive, onKeyDown } = useActiveIndex(points.length);

  const innerW = Math.max(10, width - M.left - M.right);
  const innerH = height - M.top - M.bottom;
  const n = points.length;
  const step = innerW / n;
  const x = (i) => M.left + step * (i + 0.5);

  const values = points.flatMap((p) => series.map((s) => p.values[s.key])).filter((v) => v != null);
  const { ticks, min, max } = niceTicks(Math.min(...values), Math.max(...values), 5);
  const y = linearScale([min, max], [M.top + innerH, M.top]);

  // Show every 2nd x label when the columns get narrow.
  const labelEvery = step < 30 ? 2 : 1;

  // End labels ride the last point of each line, but only when they would not collide.
  const ends = series.map((s) => {
    const last = points.map((p) => p.values[s.key]).reduce((acc, v, i) => (v != null ? i : acc), -1);
    return { ...s, last, py: last >= 0 ? y(points[last].values[s.key]) : null };
  });
  const showEndLabels = ends.every((e) => e.last >= 0) && ends.every((e, i) => ends.every((o, j) => i === j || Math.abs(e.py - o.py) > 16));

  const pointerToIndex = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    return Math.min(n - 1, Math.max(0, Math.floor((e.clientX - box.left) / step)));
  };

  const active = index != null ? points[index] : null;
  const announce = active
    ? `${active.label}: ${series.map((s) => `${s.name} ${active.values[s.key] == null ? 'no data' : format(active.values[s.key])}`).join(', ')}`
    : '';

  return (
    <div className="chart" ref={ref}>
      <ul className="legend" aria-label="Legend">
        {series.map((s) => (
          <li key={s.key}>
            <span className="legend-line" style={{ background: s.color }} /> {s.name}
          </li>
        ))}
      </ul>

      <svg
        width={width}
        height={height}
        role="group"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onFocus={(e) => e.currentTarget.matches(':focus-visible') && index == null && setActive(0)}
        onBlur={() => setActive(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className={t === 0 ? 'axis-line' : 'grid-line'} x1={M.left} x2={M.left + innerW} y1={y(t)} y2={y(t)} />
            <text className="tick" x={M.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle">{t}</text>
          </g>
        ))}

        {points.map((p, i) =>
          p.tick && i % labelEvery === 0 ? (
            <text key={p.label} className="tick" x={x(i)} y={height - 8} textAnchor="middle">{p.tick}</text>
          ) : null
        )}

        {series.map((s) => (
          <g key={s.key}>
            <path d={linePath(points, s.key, x, y)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {/* a lone point with gaps on both sides would otherwise be invisible */}
            {points.map((p, i) =>
              p.values[s.key] != null && points[i - 1]?.values[s.key] == null && points[i + 1]?.values[s.key] == null ? (
                <circle key={p.label} cx={x(i)} cy={y(p.values[s.key])} r="3" fill={s.color} />
              ) : null
            )}
          </g>
        ))}

        {showEndLabels &&
          ends.map((e) => (
            <g key={e.key}>
              <circle cx={x(e.last)} cy={e.py} r="4" fill={e.color} stroke="var(--surface)" strokeWidth="2" />
              <text className="end-label" x={x(e.last) + 10} y={e.py} dominantBaseline="middle">{e.name}</text>
            </g>
          ))}

        {active && (
          <g pointerEvents="none">
            <line className="crosshair" x1={x(index)} x2={x(index)} y1={M.top} y2={M.top + innerH} />
            {series.map((s) =>
              active.values[s.key] != null ? (
                <circle key={s.key} cx={x(index)} cy={y(active.values[s.key])} r="4" fill={s.color} stroke="var(--surface)" strokeWidth="2" />
              ) : null
            )}
          </g>
        )}

        {/* Transparent hit area: the pointer only has to be near an x position, not on a 2px line. */}
        <rect
          x={M.left}
          y={M.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onPointerMove={(e) => setActive(pointerToIndex(e))}
          onPointerLeave={() => setActive(null)}
        />
      </svg>

      {active && (
        <Tooltip
          x={x(index)}
          y={M.top + 24}
          containerWidth={width}
          title={active.label}
          rows={series.map((s) => ({
            name: s.name,
            color: s.color,
            value: active.values[s.key] == null ? 'No data' : format(active.values[s.key]),
          }))}
        />
      )}
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}
