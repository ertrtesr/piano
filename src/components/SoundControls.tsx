import type { SoundMode, AudioParams } from '../lib/audio/types';
import { ModeToggle } from './ModeToggle';
import { Knob } from './Knob';

interface SoundControlsProps {
  mode: SoundMode;
  params: AudioParams;
  isInitialized: boolean;
  onModeChange: (mode: SoundMode) => void;
  onParamChange: (key: keyof AudioParams, value: number) => void;
  onInitialize: () => void;
  onStopAll: () => void;
}

export function SoundControls({
  mode,
  params,
  isInitialized,
  onModeChange,
  onParamChange,
  onInitialize,
  onStopAll,
}: SoundControlsProps) {
  const modeDescription = mode === 'piano'
    ? 'Piano mode uses multi-harmonic synthesis with realistic attack and decay characteristics. The Release control adjusts how long notes sustain after being released (max 1 second). Use "Stop All" if you experience any audio issues.'
    : 'Synthesizer mode uses detuned sawtooth oscillators for a rich, analog-style sound. Adjust Attack for sharper or softer note onsets, and Release for longer or shorter sustain tails.';

  return (
    <div className="rounded-xl bg-gray-800/50 p-6 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-200">Sound Controls</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">Sound Mode:</span>
          <ModeToggle mode={mode} onChange={onModeChange} />
          {isInitialized && (
            <button
              className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
              onClick={onStopAll}
            >
              Stop All
            </button>
          )}
        </div>
      </div>

      {/* Knobs row */}
      <div className="flex justify-around pt-2">
        <Knob
          label="Attack"
          value={params.attack}
          min={0.001}
          max={1.0}
          step={0.001}
          displayValue={`${(params.attack * 1000).toFixed(0)}ms`}
          onChange={(v) => onParamChange('attack', v)}
        />
        <Knob
          label="Release"
          value={params.release}
          min={0.001}
          max={1.0}
          step={0.001}
          displayValue={`${(params.release * 1000).toFixed(0)}ms`}
          onChange={(v) => onParamChange('release', v)}
        />
        <Knob
          label="Delay"
          value={params.delay}
          min={0}
          max={1.0}
          step={0.01}
          displayValue={`${(params.delay * 1000).toFixed(0)}ms`}
          onChange={(v) => onParamChange('delay', v)}
        />
        <Knob
          label="Cutoff"
          value={params.cutoff}
          min={20}
          max={20000}
          step={10}
          displayValue={params.cutoff >= 1000 ? `${(params.cutoff / 1000).toFixed(1)}k` : params.cutoff.toFixed(0)}
          onChange={(v) => onParamChange('cutoff', v)}
        />
        <Knob
          label="Gain"
          value={params.gain}
          min={0}
          max={1.0}
          step={0.01}
          displayValue={`${(params.gain * 100).toFixed(0)}%`}
          onChange={(v) => onParamChange('gain', v)}
        />
      </div>

      {/* Info text */}
      <div className="bg-gray-900/50 rounded-lg p-3">
        <p className="text-xs text-gray-400 leading-relaxed">{modeDescription}</p>
      </div>

      {/* Initialize / Stop button */}
      {!isInitialized ? (
        <button
          className="w-full py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          onClick={onInitialize}
        >
          Initialize Audio
        </button>
      ) : null}
    </div>
  );
}
