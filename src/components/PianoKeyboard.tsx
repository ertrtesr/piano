import { useRef } from 'react';
import { WHITE_KEYS, BLACK_KEYS } from '../lib/audio/constants';
import { PianoKey } from './PianoKey';

interface PianoKeyboardProps {
  activeNotes: Set<number>;
  onNoteOn: (midiNote: number) => void;
  onNoteOff: (midiNote: number) => void;
}

const BLACK_KEY_OFFSETS_MAP: Record<string, number> = {
  'C#': -0.06,
  'D#': 0.06,
  'F#': -0.08,
  'G#': 0,
  'A#': 0.08,
};

export function PianoKeyboard({ activeNotes, onNoteOn, onNoteOff }: PianoKeyboardProps) {
  const activePointerIdRef = useRef<number | null>(null);
  const pointerNoteRef = useRef<number | null>(null);
  const whiteKeyWidthPercent = 100 / WHITE_KEYS.length;

  const getMidiNoteFromPoint = (clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY);
    const keyElement = element?.closest('[data-midi-note]');
    const midiNote = keyElement?.getAttribute('data-midi-note');
    return midiNote ? Number(midiNote) : null;
  };

  const releaseCurrentNote = () => {
    const currentNote = pointerNoteRef.current;
    if (currentNote !== null) {
      onNoteOff(currentNote);
      pointerNoteRef.current = null;
    }
  };

  const moveToNote = (midiNote: number | null) => {
    const currentNote = pointerNoteRef.current;
    if (midiNote === currentNote) return;

    if (currentNote !== null) {
      onNoteOff(currentNote);
    }

    pointerNoteRef.current = midiNote;

    if (midiNote !== null) {
      onNoteOn(midiNote);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    activePointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveToNote(getMidiNoteFromPoint(e.clientX, e.clientY));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    moveToNote(getMidiNoteFromPoint(e.clientX, e.clientY));
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    releaseCurrentNote();
    activePointerIdRef.current = null;
  };

  return (
    <div className="rounded-xl bg-gray-800/50 p-6">
      <h3 className="text-sm text-gray-400 font-medium mb-4 text-center">
        Piano Keyboard
      </h3>
      <div
        className="relative touch-none select-none"
        style={{ height: '200px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
      >
        <div className="flex h-full">
          {WHITE_KEYS.map((key) => (
            <PianoKey
              key={key.midiNote}
              midiNote={key.midiNote}
              isBlack={false}
              isActive={activeNotes.has(key.midiNote)}
              noteName={key.noteName}
              keyLabel={key.keyboardKey}
            />
          ))}
        </div>

        {BLACK_KEYS.map((key) => {
          const noteNameWithoutOctave = key.noteName;
          const positionIndex = key.whiteIndex + 1;
          const physicalOffset = BLACK_KEY_OFFSETS_MAP[noteNameWithoutOctave] || 0;
          const leftPercent = (positionIndex + physicalOffset) * whiteKeyWidthPercent;

          return (
            <PianoKey
              key={key.midiNote}
              midiNote={key.midiNote}
              isBlack={true}
              isActive={activeNotes.has(key.midiNote)}
              noteName={key.noteName}
              keyLabel={key.keyboardKey}
              style={{
                left: `${leftPercent}%`,
                transform: 'translateX(-50%)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
