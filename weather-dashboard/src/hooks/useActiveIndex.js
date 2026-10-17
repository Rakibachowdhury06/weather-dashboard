import { useState } from 'react';

/**
 * Tracks which data position (month, bar...) is highlighted, from the pointer OR the keyboard.
 * Arrow keys move it, Home/End jump, Escape clears it, so the chart works without a mouse.
 */
export default function useActiveIndex(count) {
  const [active, setActive] = useState(null);
  const index = active != null && active < count ? active : null; // data may shrink when a filter changes

  const onKeyDown = (e) => {
    const last = count - 1;
    const moves = {
      ArrowRight: (i) => (i == null ? 0 : Math.min(last, i + 1)),
      ArrowLeft: (i) => (i == null ? last : Math.max(0, i - 1)),
      Home: () => 0,
      End: () => last,
      Escape: () => null,
    };
    if (!moves[e.key]) return;
    e.preventDefault();
    setActive((i) => moves[e.key](i != null && i < count ? i : null));
  };

  return { index, setActive, onKeyDown };
}
