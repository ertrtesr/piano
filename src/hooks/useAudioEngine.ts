import { useRef, useCallback, useState } from 'react';
import type { SoundMode, AudioParams, ActiveNote } from '../lib/audio/types';
import {
  PIANO_PARTIALS,
  PIANO_PARTIAL_GAINS,
  PARTIAL_DECAY_RATIOS,
  PARTIAL_PHASE_OFFSETS,
  getInharmonicityB,
  getPianoAttackTime,
  getPianoDecayTime,
  getPianoReleaseTime,
  getInitialBrightness,
  getHammerNoiseFreq,
  getResonanceGain,
  SYNTH_DETUNE,
} from '../lib/audio/constants';
import {
  midiNoteToFrequency,
  knobToRelease,
  knobToDelay,
  knobToGain,
} from '../lib/utils';

const DEFAULT_PARAMS: AudioParams = {
  attack: 0.0,
  release: 0.45,
  delay: 0,
  cutoff: 12000,
  gain: 0.5,
};

type WindowWithWebAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export function useAudioEngine() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayFeedbackRef = useRef<GainNode | null>(null);
  const delayWetRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNotesRef = useRef<Map<number, ActiveNote>>(new Map());
  const pendingNotesRef = useRef<Set<number>>(new Set());

  const [isInitialized, setIsInitialized] = useState(false);
  const [mode, setModeState] = useState<SoundMode>('piano');
  const [params, setParamsState] = useState<AudioParams>(DEFAULT_PARAMS);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  const setMode = useCallback((newMode: SoundMode) => {
    setModeState(newMode);
  }, []);

  const setParam = useCallback((key: keyof AudioParams, value: number) => {
    setParamsState((prev) => {
      const next = { ...prev, [key]: value };
      // Update audio nodes in real-time
      const ctx = audioCtxRef.current;
      if (!ctx) return next;

      if (key === 'cutoff' && filterRef.current) {
        filterRef.current.frequency.setTargetAtTime(
          value,
          ctx.currentTime,
          0.02
        );
      }
      if (key === 'gain' && masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(
          knobToGain(value),
          ctx.currentTime,
          0.01
        );
      }
      if (key === 'delay' && delayNodeRef.current) {
        delayNodeRef.current.delayTime.setTargetAtTime(
          knobToDelay(value),
          ctx.currentTime,
          0.02
        );
      }

      return next;
    });
  }, []);

  const initialize = useCallback(async () => {
    if (audioCtxRef.current) {
      await audioCtxRef.current.resume();
      return Promise.resolve();
    }

    const AudioContextClass =
      window.AudioContext || (window as WindowWithWebAudio).webkitAudioContext;
    const ctx = new AudioContextClass();
    await ctx.resume();

    // Build shared audio graph
    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = knobToGain(params.gain);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Filter (lowpass)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = params.cutoff;
    filter.Q.value = 1;
    filter.connect(masterGain);
    filterRef.current = filter;

    // Delay effect
    const delayNode = ctx.createDelay(2.0);
    delayNode.delayTime.value = knobToDelay(params.delay);
    delayNodeRef.current = delayNode;

    const feedbackGain = ctx.createGain();
    feedbackGain.gain.value = 0.3;
    delayFeedbackRef.current = feedbackGain;

    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.3;
    delayWetRef.current = wetGain;

    // Delay routing: filter -> delay -> wetGain -> masterGain
    //                   delay -> feedbackGain -> delay (loop)
    filter.connect(delayNode);
    delayNode.connect(wetGain);
    wetGain.connect(masterGain);
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);

    audioCtxRef.current = ctx;
    setIsInitialized(true);
  }, [params]);

  const stopAll = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const releaseTime = 0.1;
    activeNotesRef.current.forEach((note) => {
      note.envelopeGain.gain.cancelScheduledValues(now);
      note.envelopeGain.gain.setValueAtTime(note.envelopeGain.gain.value, now);
      note.envelopeGain.gain.linearRampToValueAtTime(0, now + releaseTime);
      note.oscillators.forEach((osc) => osc.stop(now + releaseTime + 0.05));
    });
    activeNotesRef.current.clear();
    pendingNotesRef.current.clear();
    setActiveNotes(new Set());
  }, []);

  const noteOn = useCallback(
    async (midiNote: number) => {
      if (activeNotesRef.current.has(midiNote) || pendingNotesRef.current.has(midiNote)) return;

      pendingNotesRef.current.add(midiNote);
      if (!audioCtxRef.current) {
        await initialize();
      }
      const ctx = audioCtxRef.current;
      if (!ctx || !pendingNotesRef.current.has(midiNote)) {
        pendingNotesRef.current.delete(midiNote);
        return;
      }
      pendingNotesRef.current.delete(midiNote);

      const frequency = midiNoteToFrequency(midiNote);
      const attackTime =
        mode === 'piano' ? getPianoAttackTime(midiNote) : params.attack;
      const now = ctx.currentTime;

      const envelopeGain = ctx.createGain();
      envelopeGain.gain.setValueAtTime(0, now);
      envelopeGain.gain.linearRampToValueAtTime(
        mode === 'piano' ? 0.72 : 0.6,
        now + attackTime
      );
      envelopeGain.gain.exponentialRampToValueAtTime(
        mode === 'piano' ? 0.36 : 0.5,
        now + attackTime + (mode === 'piano' ? 0.28 : 0.1)
      );

      envelopeGain.connect(filterRef.current!);

      const oscillators: OscillatorNode[] = [];

      if (mode === 'piano') {
        const inharmonicityB = getInharmonicityB(midiNote);
        const baseReleaseTime = knobToRelease(params.release);
        const noteDecayTime = getPianoDecayTime(baseReleaseTime, midiNote);
        const initialBrightness = getInitialBrightness(midiNote);
        const resonanceGain = getResonanceGain(midiNote);
        const partialGains: GainNode[] = [];

        const brightnessFilter = ctx.createBiquadFilter();
        brightnessFilter.type = 'lowpass';
        brightnessFilter.frequency.setValueAtTime(initialBrightness, now);
        brightnessFilter.frequency.exponentialRampToValueAtTime(
          Math.max(950, initialBrightness * 0.22),
          now + noteDecayTime * 0.7
        );
        brightnessFilter.Q.value = 0.65;
        brightnessFilter.connect(envelopeGain);

        for (let i = 0; i < PIANO_PARTIALS; i++) {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';

          const n = i + 1;
          const freq = frequency * n * Math.sqrt(1 + inharmonicityB * n * n);
          osc.frequency.setValueAtTime(freq, now);
          osc.detune.setValueAtTime((Math.random() - 0.5) * 3, now);

          const phaseOffset = PARTIAL_PHASE_OFFSETS[i] / n;
          osc.start(now + phaseOffset * 0.001);

          let gain = PIANO_PARTIAL_GAINS[i] * (0.94 + Math.random() * 0.12);
          if (n === 1) gain *= resonanceGain;
          oscGain.gain.setValueAtTime(gain, now);

          const partialDecay = noteDecayTime * PARTIAL_DECAY_RATIOS[i];
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(partialDecay, 0.05));

          osc.connect(oscGain).connect(brightnessFilter);
          oscillators.push(osc);
          partialGains.push(oscGain);
        }

        const hammerDuration = 0.028;
        const hammerBufferSize = Math.ceil(ctx.sampleRate * hammerDuration);
        const hammerBuffer = ctx.createBuffer(1, hammerBufferSize, ctx.sampleRate);
        const hammerData = hammerBuffer.getChannelData(0);

        for (let i = 0; i < hammerBufferSize; i++) {
          const t = i / hammerBufferSize;
          const envelope = Math.exp(-t * 28) * (1 - Math.pow(t, 2));
          hammerData[i] = (Math.random() * 2 - 1) * envelope;
        }
        const hammerNoise = ctx.createBufferSource();
        hammerNoise.buffer = hammerBuffer;

        const hammerGainNode = ctx.createGain();
        hammerGainNode.gain.setValueAtTime(0.055, now);
        hammerGainNode.gain.exponentialRampToValueAtTime(0.001, now + hammerDuration);

        const hammerFilter = ctx.createBiquadFilter();
        hammerFilter.type = 'bandpass';
        hammerFilter.frequency.value = getHammerNoiseFreq(midiNote);
        hammerFilter.Q.value = 2.2;

        hammerNoise.connect(hammerFilter);
        hammerFilter.connect(hammerGainNode);
        hammerGainNode.connect(envelopeGain);
        hammerNoise.start(now);
        hammerNoise.stop(now + hammerDuration + 0.01);

        const bodyOsc = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        bodyOsc.type = 'triangle';
        bodyOsc.frequency.setValueAtTime(frequency * 0.5, now);
        bodyGain.gain.setValueAtTime(0.045 * resonanceGain, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + noteDecayTime * 1.35);
        bodyOsc.connect(bodyGain).connect(envelopeGain);
        bodyOsc.start(now);
        oscillators.push(bodyOsc);
        partialGains.push(bodyGain);

        activeNotesRef.current.set(midiNote, { oscillators, envelopeGain, partialGains, hammerNoise });
      } else {
        // Synthesizer: 3 detuned sawtooth oscillators
        for (const detune of SYNTH_DETUNE) {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(frequency, now);
          osc.detune.setValueAtTime(detune, now);
          oscGain.gain.setValueAtTime(0.3, now);
          osc.connect(oscGain).connect(envelopeGain);
          osc.start();
          oscillators.push(osc);
        }

        activeNotesRef.current.set(midiNote, {
          oscillators,
          envelopeGain,
          partialGains: [],
        });
      }

      setActiveNotes((prev) => new Set(prev).add(midiNote));
    },
    [mode, params.attack, params.release, initialize]
  );

  const noteOff = useCallback(
    (midiNote: number) => {
      pendingNotesRef.current.delete(midiNote);
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const note = activeNotesRef.current.get(midiNote);
      if (!note) return;

      const releaseTime =
        mode === 'piano'
          ? getPianoReleaseTime(knobToRelease(params.release), midiNote)
          : knobToRelease(params.release);
      const now = ctx.currentTime;

      note.envelopeGain.gain.cancelScheduledValues(now);
      note.envelopeGain.gain.setValueAtTime(note.envelopeGain.gain.value, now);
      note.envelopeGain.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);
      note.oscillators.forEach((osc) => osc.stop(now + releaseTime + 0.05));

      activeNotesRef.current.delete(midiNote);
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(midiNote);
        return next;
      });
    },
    [mode, params.release]
  );

  return {
    isInitialized,
    mode,
    params,
    activeNotes,
    initialize,
    stopAll,
    noteOn,
    noteOff,
    setMode,
    setParam,
  };
}
