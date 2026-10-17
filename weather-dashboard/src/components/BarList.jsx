import { useState } from 'react';
import Tooltip from './Tooltip.jsx';

/**
 * Horizontal bars with the value written at the bar tip.
 * rows: [{ key, label, value, text, detail, highlighted }]
 * When any row is highlighted, the rest turn gray (emphasis) so the selection stands out.
 */
export default function BarList({ rows, color }) {
  const [hover, setHover] = useState(null); // { key, x, y }
  const max = Math.max(...rows.map((r) => r.value), 1);
  const anyHighlight = rows.some((r) => r.highlighted);
  const hovered = rows.find((r) => r.key === hover?.key);

  const show = (key) => (e) => {
    const box = e.currentTarget.parentElement.getBoundingClientRect();
    const own = e.currentTarget.getBoundingClientRect();
    const useRow = e.type === 'focus';
    setHover({ key, x: (useRow ? own.left + 60 : e.clientX) - box.left, y: (useRow ? own.top : e.clientY) - box.top - 8 });
  };

  return (
    <div className="barlist" onPointerLeave={() => setHover(null)}>
      {rows.map((r) => (
        <div
          key={r.key}
          className="barlist-row"
          tabIndex={0}
          onPointerMove={show(r.key)}
          onFocus={show(r.key)}
          onBlur={() => setHover(null)}
        >
          <span className="barlist-label">{r.label}</span>
          <span className="barlist-track">
            <span
              className="barlist-bar"
              style={{
                width: `calc((100% - 84px) * ${r.value / max})`,
                background: anyHighlight && !r.highlighted ? 'var(--bar-muted)' : color,
              }}
            />
            <span className="barlist-value">{r.text}</span>
          </span>
        </div>
      ))}
      {hovered && (
        <Tooltip
          x={hover.x}
          y={hover.y}
          containerWidth={320}
          title={hovered.label}
          rows={[{ name: hovered.detail, color, value: hovered.text }]}
        />
      )}
    </div>
  );
}
