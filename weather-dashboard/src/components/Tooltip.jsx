/**
 * Floating readout. The value leads (bold), the name follows (secondary).
 * Text is rendered by React as plain text, never as HTML, because labels come from data.
 */
export default function Tooltip({ x, y, containerWidth, title, rows }) {
  const flip = x > containerWidth * 0.6; // near the right edge, open to the left of the pointer
  return (
    <div
      className="tooltip"
      style={{ left: x, top: y, transform: `translateX(${flip ? 'calc(-100% - 12px)' : '12px'})` }}
    >
      <div className="tooltip-title">{title}</div>
      {rows.map((r) => (
        <div className="tooltip-row" key={r.name}>
          <span className="tooltip-key" style={{ background: r.color }} />
          <strong>{r.value}</strong>
          <span className="tooltip-name">{r.name}</span>
        </div>
      ))}
    </div>
  );
}
