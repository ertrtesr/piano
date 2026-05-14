import { useRef, useState, useEffect, useCallback } from 'react';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue?: string;
  onChange: (value: number) => void;
}

export function Knob({ label, value, min, max, step = 0.01, displayValue, onChange }: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const normalizedValue = (value - min) / (max - min);
  const rotation = -135 + normalizedValue * 270;

  const formatDisplay = useCallback(() => {
    if (displayValue) return displayValue;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    if (value >= 100) return value.toFixed(0);
    if (value >= 1) return value.toFixed(1);
    if (value >= 0.01) return value.toFixed(2);
    return value.toFixed(3);
  }, [value, displayValue]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startYRef.current - moveEvent.clientY;
      const range = max - min;
      const sensitivity = 200;
      let newValue = startValueRef.current + (delta / sensitivity) * range;
      newValue = Math.min(max, Math.max(min, newValue));
      if (step) {
        newValue = Math.round(newValue / step) * step;
      }
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [value, min, max, step, onChange]);

  useEffect(() => {
    if (!isDragging) return;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <div
        ref={knobRef}
        className="relative w-14 h-14 cursor-pointer"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => onChange(min)}
      >
        <svg viewBox="0 0 56 56" className="w-full h-full">
          {/* Background ring */}
          <circle
            cx="28" cy="28" r="24"
            fill="none"
            stroke="#3a3a4a"
            strokeWidth="3"
          />
          {/* Track arc */}
          <path
            d="M 8 38 A 22 22 0 1 1 48 38"
            fill="none"
            stroke="#2a2a3a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Active arc */}
          <path
            d="M 8 38 A 22 22 0 1 1 48 38"
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${normalizedValue * 138.23} 138.23`}
          />
          {/* Knob body */}
          <circle
            cx="28" cy="28" r="18"
            fill="url(#knobGradient)"
            stroke="#4a4a5a"
            strokeWidth="1"
          />
          {/* Indicator line */}
          <line
            x1="28" y1="28"
            x2="28" y2="14"
            stroke="#e2e8f0"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${rotation} 28 28)`}
          />
          {/* Gradient definition */}
          <defs>
            <radialGradient id="knobGradient" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#5a5a6a" />
              <stop offset="100%" stopColor="#3a3a4a" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <span className="text-xs text-gray-300 font-mono">{formatDisplay()}</span>
    </div>
  );
}
