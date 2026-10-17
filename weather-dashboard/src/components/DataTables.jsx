import { fmt0, fmt1, capitalize } from '../utils/format.js';

/** The table view: every number the charts draw, readable without hovering. */
export default function DataTables({ monthly, weather }) {
  return (
    <div className="tables">
      <section className="card">
        <h2>Monthly summary</h2>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Average temperatures and total precipitation by month</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col" className="num">Days</th>
                <th scope="col" className="num">Avg high (°C)</th>
                <th scope="col" className="num">Avg low (°C)</th>
                <th scope="col" className="num">Precipitation (mm)</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.ym}>
                  <th scope="row">{m.label}</th>
                  <td className="num">{m.days}</td>
                  <td className="num">{fmt1(m.avgHigh)}</td>
                  <td className="num">{fmt1(m.avgLow)}</td>
                  <td className="num">{fmt1(m.precip)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Days by weather type</h2>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Number and share of days by weather type</caption>
            <thead>
              <tr>
                <th scope="col">Weather</th>
                <th scope="col" className="num">Days</th>
                <th scope="col" className="num">Share</th>
              </tr>
            </thead>
            <tbody>
              {weather.map((w) => (
                <tr key={w.weather}>
                  <th scope="row">{capitalize(w.weather)}</th>
                  <td className="num">{fmt0(w.days)}</td>
                  <td className="num">{fmt0(w.share * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
