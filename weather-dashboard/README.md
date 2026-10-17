# Seattle Weather Dashboard

An interactive data dashboard built with **React**. It explores four years of daily weather (1,461 days, 2012–2015): filter by year and weather type, and every tile, chart and table updates together.

**Live demo:** https://rakibachowdhury06.github.io/weather-dashboard/

## What you can do

- **Filter** by year and weather type. One filter row scopes everything below it.
- Read four **summary tiles**: average daily high, total precipitation, days with precipitation, hottest day. When one year is selected, the first two show the change versus the previous year.
- Explore three **charts**: temperature by month (line), precipitation by month (columns) and days by weather type (bars, with the selected type highlighted).
- **Hover or use the arrow keys** on a chart to see exact values in a tooltip.
- Switch to the **Table** view to see every number the charts draw, and **download the selected days as CSV**.
- Switch between **light and dark mode** (it follows your system setting by default).

## What it demonstrates

| Skill | Where |
| --- | --- |
| Loading data with `fetch`, with loading and error states and a retry button | `hooks/useWeatherData.js`, `App.jsx` |
| Parsing and validating CSV (rejects wrong columns and bad values) | `utils/csv.js` |
| Data analysis in code: filtering, grouping by month, averages, totals, shares, year-over-year change | `utils/aggregate.js` |
| Derived state with `useMemo`: all numbers come from raw rows + filters | `App.jsx` |
| Charts drawn from scratch in SVG: scales, "nice" axis ticks, gaps for missing data | `components/LineChart.jsx`, `ColumnChart.jsx`, `utils/scale.js` |
| Interaction: hover tooltips, keyboard navigation, screen-reader announcements | `hooks/useActiveIndex.js`, `Tooltip.jsx` |
| Accessible design: a table view for every chart, labelled controls, focus styles, colour-blind-safe palette (checked with a validation script) | `DataTables.jsx`, `styles.css` |
| Responsive layout, light and dark theme | `styles.css`, `hooks/useTheme.js` |
| Unit tests (Vitest) for the data logic | `utils/aggregate.test.js` |
| CI/CD: tests, build and deploy to GitHub Pages on every push | `.github/workflows/deploy.yml` |

## Data

Daily weather for Seattle from NOAA's National Climatic Data Center, taken from the open-source [`vega-datasets`](https://github.com/vega/vega-datasets) package (U.S. government data). The `weather` label (sun, rain, drizzle, snow, fog) was derived from the original measurements by the package authors, and the dataset is meant for teaching, so treat the numbers as an example rather than an official climate record. The file is `public/data/seattle-weather.csv`.

## Run it locally

Requires [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install
npm run dev      # start the dev server
npm test         # run the unit tests
npm run build    # production build in /dist
```

## Project structure

```
public/data/    seattle-weather.csv
src/
  components/   FilterBar, StatTile, LineChart, ColumnChart, BarList, Tooltip, DataTables
  hooks/        useWeatherData, useActiveIndex, useElementWidth, useTheme
  utils/        csv, aggregate (+ tests), scale, format
  App.jsx       state, filters and layout
```

## Ideas for next steps

- Swap in a local dataset (for example City of Ottawa open data). Only `utils/csv.js` and the labels in `App.jsx` would change.
- Add a date-range filter and a month heatmap.
