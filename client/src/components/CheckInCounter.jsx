import { useEffect, useRef, useState } from 'react';

const TICKS_REQUIRED = 3;
const TICK_MS = 500;

export default function CheckInCounter({ onConfirm }) {
  const [holding, setHolding] = useState(false);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!holding) return;
    intervalRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, TICK_MS);
    return () => clearInterval(intervalRef.current);
  }, [holding]); // <- missing `tick`

  useEffect(() => {
    if (tick >= TICKS_REQUIRED) {
      clearInterval(intervalRef.current);
      setHolding(false);
      setTick(0);
      onConfirm();
    }
  }, [tick, onConfirm]);

  function handleMouseDown() {
    setTick(0);
    setHolding(true);
  }

  function handleMouseUp() {
    clearInterval(intervalRef.current);
    setHolding(false);
    setTick(0);
  }

  const label = holding
    ? `Hold... ${tick + 1}/${TICKS_REQUIRED}`
    : 'Hold to check in';

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {label}
    </button>
  );
}
