export function midiNoteToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

export function isBlackKey(midiNote: number): boolean {
  const pitchClass = midiNote % 12;
  return [1, 3, 6, 8, 10].includes(pitchClass);
}

export function knobToCutoffFrequency(knobValue: number): number {
  const minFreq = 20;
  const maxFreq = 20000;
  return minFreq * Math.pow(maxFreq / minFreq, knobValue);
}

export function knobToAttack(knobValue: number): number {
  return 0.002 + knobValue * 0.5;
}

export function knobToRelease(knobValue: number): number {
  return Math.max(0.001, knobValue * 1.0);
}

export function knobToDelay(knobValue: number): number {
  return knobValue * 1.0;
}

export function knobToGain(knobValue: number): number {
  return knobValue;
}
