export type SoundMode = 'piano' | 'synthesizer';

export interface AudioParams {
  attack: number;
  release: number;
  delay: number;
  cutoff: number;
  gain: number;
}

export interface ActiveNote {
  oscillators: OscillatorNode[];
  envelopeGain: GainNode;
  partialGains: GainNode[];
  hammerNoise?: AudioBufferSourceNode;
}

export interface PianoKeyData {
  midiNote: number;
  noteName: string;
  keyboardKey: string;
  isBlack: boolean;
  blackKeyIndex?: number;
}
