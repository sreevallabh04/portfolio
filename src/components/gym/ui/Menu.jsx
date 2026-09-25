import React, { useEffect, useRef, useState } from 'react';
import { useInputLayer, LAYER } from '../engine/input';

/**
 * Keyboard/gamepad/touch list menu with the classic ▶ cursor. `columns` lays
 * the items out in a grid (the battle command box is 2×2).
 */
export default function Menu({
  items,
  onSelect,
  onCancel,
  input,
  audio,
  priority = LAYER.menu,
  columns = 1,
  initial = 0,
  active = true,
  className = '',
  itemClassName = '',
  label,
  onHighlight,
  onKey,
}) {
  const [rawIndex, setIndex] = useState(initial);
  const index = Math.max(0, Math.min(rawIndex, items.length - 1));
  const refs = useRef([]);

  useEffect(() => {
    onHighlight?.(items[index], index);
    refs.current[index]?.scrollIntoView?.({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const move = (delta) => {
    setIndex((raw) => {
      const current = Math.max(0, Math.min(raw, items.length - 1));
      let next = current + delta;
      if (next < 0) next = columns > 1 ? current : items.length - 1;
      if (next >= items.length) next = columns > 1 ? current : 0;
      if (next !== current) audio?.play('move');
      return next;
    });
  };

  const choose = (i) => {
    const item = items[i];
    if (!item || item.disabled) {
      audio?.play('bump');
      return;
    }
    audio?.play('select');
    onSelect?.(item, i);
  };

  useInputLayer(
    input,
    {
      onPress(button) {
        if (button === 'up') move(-columns);
        else if (button === 'down') move(columns);
        else if (button === 'left' && columns > 1) move(-1);
        else if (button === 'right' && columns > 1) move(1);
        else if (button === 'a') choose(index);
        else if (button === 'b' && onCancel) {
          audio?.play('back');
          onCancel();
        } else onKey?.(button);
      },
    },
    priority,
    active
  );

  return (
    <ul
      className={`gym-menu ${className}`}
      role="menu"
      aria-label={label}
      style={columns > 1 ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
    >
      {items.map((item, i) => (
        <li key={item.key || item.label} role="none">
          <button
            type="button"
            role="menuitem"
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`gym-menu-item ${i === index ? 'is-active' : ''} ${item.disabled ? 'is-disabled' : ''} ${itemClassName}`}
            aria-disabled={item.disabled || undefined}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setIndex(i)}
            onClick={() => {
              setIndex(i);
              choose(i);
            }}
          >
            <span className="gym-cursor" aria-hidden="true">
              ▶
            </span>
            <span className="gym-menu-label">{item.label}</span>
            {item.detail && <span className="gym-menu-detail">{item.detail}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
