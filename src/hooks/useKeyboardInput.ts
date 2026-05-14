import { useEffect, useRef } from 'react';

export function useKeyboardInput(options: {
  onNoteOn: (midiNote: number) => void;
  onNoteOff: (midiNote: number) => void;
  keyMap: Map<string, number>;
}) {
  const { onNoteOn, onNoteOff, keyMap } = options;
  const pressedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const normalizeKey = (key: string) =>
      key.length === 1 ? key.toUpperCase() : key;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = normalizeKey(e.key);
      if (keyMap.has(key) && !pressedKeysRef.current.has(key)) {
        e.preventDefault();
        pressedKeysRef.current.add(key);
        onNoteOn(keyMap.get(key)!);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = normalizeKey(e.key);
      if (keyMap.has(key)) {
        e.preventDefault();
        pressedKeysRef.current.delete(key);
        onNoteOff(keyMap.get(key)!);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onNoteOn, onNoteOff, keyMap]);

  return { pressedKeys: pressedKeysRef };
}
