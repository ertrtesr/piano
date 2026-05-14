import { useRef, useCallback, useEffect } from 'react';

export function useKnob(options: {
  value: number;
  min: number;
  max: number;
  sensitivity: number;
  onChange: (value: number) => void;
}) {
  const { value, min, max, sensitivity, onChange } = options;
  const knobRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startValueRef.current = value;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = startYRef.current - moveEvent.clientY;
      const newValue = Math.min(max, Math.max(min, startValueRef.current + (delta / sensitivity)));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [value, min, max, sensitivity, onChange]);

  useEffect(() => {
    const el = knobRef.current;
    if (!el) return;
    el.addEventListener('mousedown', handleMouseDown as unknown as EventListener);
    return () => el.removeEventListener('mousedown', handleMouseDown as unknown as EventListener);
  }, [handleMouseDown]);

  return { knobRef };
}
