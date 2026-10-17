export default function StatTile({ label, value, unit, sub, delta }) {
  return (
    <div className="tile">
      <div className="tile-label">{label}</div>
      <div className="tile-value">
        {value}
        {unit && value !== '–' && <span className="tile-unit"> {unit}</span>}
      </div>
      {delta && <div className="tile-delta">{delta}</div>}
      {sub && <div className="tile-sub">{sub}</div>}
    </div>
  );
}
