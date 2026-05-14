// Piano synthesis with 12 partials
export const PIANO_PARTIALS = 12;

export const PIANO_PARTIAL_GAINS = [
  0.44,
  0.22,
  0.14,
  0.085,
  0.052,
  0.034,
  0.022,
  0.014,
  0.009,
  0.006,
  0.004,
  0.0025,
];

export const PARTIAL_DECAY_RATIOS = [
  1.25,
  1.05,
  0.88,
  0.72,
  0.58,
  0.46,
  0.34,
  0.25,
  0.18,
  0.13,
  0.1,
  0.08,
];

export const PARTIAL_PHASE_OFFSETS = [
  0,
  0.11,
  0.27,
  0.43,
  0.61,
  0.79,
  0.98,
  1.18,
  1.39,
  1.61,
  1.84,
  2.08,
];

// Inharmonicity coefficient
export function getInharmonicityB(midiNote: number): number {
  if (midiNote < 36) return 0.006;
  if (midiNote < 48) return 0.0035;
  if (midiNote < 60) return 0.0018;
  if (midiNote < 72) return 0.0009;
  if (midiNote < 84) return 0.00045;
  return 0.00025;
}

// Attack time - very fast for piano
export function getPianoAttackTime(midiNote: number): number {
  return Math.max(0.001, 0.003 + (60 - midiNote) * 0.000035);
}

// Sustain/decay time per note
export function getPianoDecayTime(_baseRelease: number, midiNote: number): number {
  const normalizedNote = (midiNote - 21) / 88;
  return 5.2 - normalizedNote * 4.25;
}

// Release time
export function getPianoReleaseTime(baseRelease: number, midiNote: number): number {
  const normalizedNote = (midiNote - 21) / 88;
  const baseReleaseTime = 0.18 + baseRelease * 1.8;
  return baseReleaseTime * (0.4 + (1 - normalizedNote) * 0.6);
}

// Initial brightness (lowpass filter cutoff)
export function getInitialBrightness(midiNote: number): number {
  const normalizedNote = (midiNote - 21) / 88;
  return 2600 + normalizedNote * 9200;
}

// Hammer noise center frequency
export function getHammerNoiseFreq(midiNote: number): number {
  const normalizedNote = (midiNote - 21) / 88;
  return 900 + normalizedNote * 3200;
}

// String resonance boost at fundamental
export function getResonanceGain(midiNote: number): number {
  if (midiNote < 40) return 1.1;
  if (midiNote > 76) return 0.96;
  return 1.08 + (midiNote - 40) * 0.003;
}

// Synth: 3 detuned sawtooth oscillators
export const SYNTH_DETUNE = [-7, 0, 7];

// Black key positions within an octave (offset in white-key-width units)
export const BLACK_KEY_OFFSETS = [0.65, 1.65, 3.65, 4.65, 5.65];

// All 24 keys (14 white + 10 black) for two octaves C4-B5
// Keys are ordered for rendering: white keys in order, black keys interleaved by position
export const WHITE_KEYS = [
  // Lower octave (C4-B4)
  { midiNote: 60, noteName: 'C', keyboardKey: 'A' },
  { midiNote: 62, noteName: 'D', keyboardKey: 'S' },
  { midiNote: 64, noteName: 'E', keyboardKey: 'D' },
  { midiNote: 65, noteName: 'F', keyboardKey: 'F' },
  { midiNote: 67, noteName: 'G', keyboardKey: 'G' },
  { midiNote: 69, noteName: 'A', keyboardKey: 'H' },
  { midiNote: 71, noteName: 'B', keyboardKey: 'J' },
  // Upper octave (C5-B5)
  { midiNote: 72, noteName: 'C', keyboardKey: 'K' },
  { midiNote: 74, noteName: 'D', keyboardKey: 'L' },
  { midiNote: 76, noteName: 'E', keyboardKey: ';' },
  { midiNote: 77, noteName: 'F', keyboardKey: "'" },
  { midiNote: 79, noteName: 'G', keyboardKey: 'Z' },
  { midiNote: 81, noteName: 'A', keyboardKey: 'X' },
  { midiNote: 83, noteName: 'B', keyboardKey: 'C' },
];

export const BLACK_KEYS = [
  // Lower octave (C#4-A#4)
  { midiNote: 61, noteName: 'C#', keyboardKey: 'W', whiteIndex: 0, octave: 0 },
  { midiNote: 63, noteName: 'D#', keyboardKey: 'E', whiteIndex: 1, octave: 0 },
  { midiNote: 66, noteName: 'F#', keyboardKey: 'R', whiteIndex: 3, octave: 0 },
  { midiNote: 68, noteName: 'G#', keyboardKey: 'T', whiteIndex: 4, octave: 0 },
  { midiNote: 70, noteName: 'A#', keyboardKey: 'Y', whiteIndex: 5, octave: 0 },
  // Upper octave (C#5-A#5)
  { midiNote: 73, noteName: 'C#', keyboardKey: 'U', whiteIndex: 7, octave: 1 },
  { midiNote: 75, noteName: 'D#', keyboardKey: 'I', whiteIndex: 8, octave: 1 },
  { midiNote: 78, noteName: 'F#', keyboardKey: 'O', whiteIndex: 10, octave: 1 },
  { midiNote: 80, noteName: 'G#', keyboardKey: 'P', whiteIndex: 11, octave: 1 },
  { midiNote: 82, noteName: 'A#', keyboardKey: '[', whiteIndex: 12, octave: 1 },
];
