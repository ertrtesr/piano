import { SoundControls } from './components/SoundControls';
import { PianoKeyboard } from './components/PianoKeyboard';
import { BottomInfo } from './components/BottomInfo';
import { BottomToolbar } from './components/BottomToolbar';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { WHITE_KEYS, BLACK_KEYS } from './lib/audio/constants';

// Build keyboard map: key string -> midiNote
const keyMap = new Map<string, number>();
WHITE_KEYS.forEach((k) => keyMap.set(k.keyboardKey, k.midiNote));
BLACK_KEYS.forEach((k) => {
  if (k.keyboardKey) keyMap.set(k.keyboardKey, k.midiNote);
});

function App() {
  const {
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
  } = useAudioEngine();

  useKeyboardInput({
    onNoteOn: noteOn,
    onNoteOff: noteOff,
    keyMap,
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6 flex-1">
        <SoundControls
          mode={mode}
          params={params}
          isInitialized={isInitialized}
          onModeChange={setMode}
          onParamChange={setParam}
          onInitialize={initialize}
          onStopAll={stopAll}
        />
        <PianoKeyboard
          activeNotes={activeNotes}
          onNoteOn={noteOn}
          onNoteOff={noteOff}
        />
        <BottomInfo />
      </div>
      <BottomToolbar />
    </div>
  );
}

export default App;
