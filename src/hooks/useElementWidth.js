import { useEffect, useRef, useState } from 'react';

/** Measures an element so SVG charts can draw at its real pixel width (crisp text, no stretching). */
export default function useElementWidth(initial = 640) {
  const ref = useRef(null);
  const [width, setWidth] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setWidth(Math.round(el.getBoundingClientRect().width) || initial);
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width) || initial));
    observer.observe(el);
    return () => observer.disconnect();
  }, [initial]);

  return [ref, width];
}
