import { useCallback, useEffect, useState } from 'react';
import { parseWeatherCsv } from '../utils/csv.js';

/** Loads the CSV once and reports { status: 'loading' | 'error' | 'ready', rows, error, reload }. */
export default function useWeatherData() {
  const [state, setState] = useState({ status: 'loading', rows: [], error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', rows: [], error: null });

    fetch(`${import.meta.env.BASE_URL}data/seattle-weather.csv`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load the data file (HTTP ${res.status}).`);
        return res.text();
      })
      .then((text) => setState({ status: 'ready', rows: parseWeatherCsv(text), error: null }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', rows: [], error: err.message });
      });

    return () => controller.abort(); // ignore the result if the component unmounts first
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
