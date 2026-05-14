interface PianoKeyProps {
  midiNote: number;
  isBlack: boolean;
  isActive: boolean;
  noteName: string;
  keyLabel: string;
  style?: React.CSSProperties;
}

export function PianoKey({
  midiNote,
  isBlack,
  isActive,
  noteName,
  keyLabel,
  style,
}: PianoKeyProps) {
  if (isBlack) {
    return (
      <div
        data-midi-note={midiNote}
        className={`absolute top-0 z-10 flex flex-col items-center justify-end pb-1.5 rounded-b-md cursor-pointer transition-colors duration-75 ${
          isActive
            ? 'bg-indigo-500 shadow-inner'
            : 'bg-gray-900 hover:bg-gray-700'
        }`}
        style={{
          ...style,
          width: '38px',
          height: '120px',
          boxShadow: isActive
            ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
            : '0 2px 6px rgba(0,0,0,0.5)',
        }}
      >
        {keyLabel && (
          <span className="text-[10px] text-gray-400 font-mono">{keyLabel}</span>
        )}
      </div>
    );
  }

  return (
    <div
      data-midi-note={midiNote}
      className={`relative flex-1 flex flex-col items-center justify-end pb-2 rounded-b-lg cursor-pointer border transition-colors duration-75 ${
        isActive
          ? 'bg-indigo-100 border-indigo-300'
          : 'bg-white border-gray-300 hover:bg-gray-50'
      }`}
      style={{
        height: '200px',
        boxShadow: isActive
          ? 'inset 0 2px 4px rgba(0,0,0,0.1)'
          : '0 2px 4px rgba(0,0,0,0.15)',
      }}
    >
      <span className="text-sm text-gray-500 font-medium mb-1">{noteName}</span>
      {keyLabel && (
        <span className="text-xs text-gray-400 font-mono bg-gray-100 rounded px-1.5 py-0.5">
          {keyLabel}
        </span>
      )}
    </div>
  );
}
