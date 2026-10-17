import useElementWidth from '../hooks/useElementWidth.js';
import useActiveIndex from '../hooks/useActiveIndex.js';
import { linearScale, niceTicks } from '../utils/scale.js';
import Tooltip from './Tooltip.jsx';

const M = { top: 24, right: 8, bottom: 28, left: 44 };

/** A column with a 4px rounded top and a square bottom, so it sits flat on the baseline. */
function columnPath(x, y, w, h) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

/**
 * Single-series column chart drawn with plain SVG.
 * points: [{ label, tick, value: number | null }]
 */
export default function ColumnChart({ points, color, seriesName, format, height = 260, ariaLabel }) {
  const [ref, width] = useElementWidth();
  const { index, setActive, onKeyDown } = useActiveIndex(points.length);

  const innerW = Math.max(10, width - M.left - M.right);
  const innerH = height - M.top - M.bottom;
  const n = points.length;
  const band = innerW / n;
  const barW = Math.max(1.5, Math.min(24, band - 2)); // never wider than 24px, always a 2px gap
  const labelEvery = band < 30 ? 2 : 1;

  const values = points.map((p) => p.value ?? 0);
  const { ticks, max } = niceTicks(0, Math.max(...values), 4);
  const y = linearScale([0, max], [M.top + innerH, M.top]);
  const cx = (i) => M.left + band * (i + 0.5);

  // Label only the tallest column; the axis and the tooltip carry the rest.
  const peak = values.indexOf(Math.max(...values));
  const peakAnchor = cx(peak) < M.left + 36 ? 'start' : cx(peak) > width - 36 ? 'end' : 'middle';
  const peakX = peakAnchor === 'start' ? cx(peak) - barW / 2 : peakAnchor === 'end' ? cx(peak) + barW / 2 : cx(peak);

  const active = index != null ? points[index] : null;
  const pointerToIndex = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    return Math.min(n - 1, Math.max(0, Math.floor((e.clientX - box.left) / band)));
  };

  return (
    <div className="chart" ref={ref}>
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

        {points.map((p, i) => (
          <g key={p.label}>
            {p.value > 0 && (
              <path
                d={columnPath(cx(i) - barW / 2, y(p.value), barW, y(0) - y(p.value))}
                fill={color}
                opacity={index == null || index === i ? 1 : 0.5}
              />
            )}
            {p.tick && i % labelEvery === 0 && (
              <text className="tick" x={cx(i)} y={height - 8} textAnchor="middle">{p.tick}</text>
            )}
          </g>
        ))}

        {points[peak]?.value > 0 && (
          <text className="peak-label" x={peakX} y={y(points[peak].value) - 6} textAnchor={peakAnchor}>
            {format(points[peak].value)}
          </text>
        )}

        {/* One full-height hit area per column: much easier to hit than a 6px bar. */}
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
          x={cx(index)}
          y={M.top + 8}
          containerWidth={width}
          title={active.label}
          rows={[{ name: seriesName, color, value: active.value == null ? 'No data' : format(active.value) }]}
        />
      )}
      <p className="sr-only" aria-live="polite">
        {active ? `${active.label}: ${active.value == null ? 'no data' : format(active.value)}` : ''}
      </p>
    </div>
  );
}
