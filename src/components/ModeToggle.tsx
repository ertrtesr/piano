import type { SoundMode } from '../lib/audio/types';

interface ModeToggleProps {
  mode: SoundMode;
  onChange: (mode: SoundMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-800 p-0.5 gap-0">
      <button
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
          mode === 'piano'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
        onClick={() => onChange('piano')}
      >
        Piano
      </button>
      <button
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
          mode === 'synthesizer'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
        onClick={() => onChange('synthesizer')}
      >
        Synthesizer
      </button>
    </div>
  );
}
