export function BottomInfo() {
  return (
    <div className="rounded-xl bg-gray-800/30 p-4 space-y-3">
      <p className="text-xs text-gray-500 text-center">
        Play notes by clicking the piano keys or using your computer keyboard. You may need to click "Initialize Audio" first due to browser audio policies.
      </p>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <p className="text-gray-400 font-medium">Keyboard Controls - Lower Octave (C4-B4):</p>
          <p className="text-gray-500">White keys: <span className="font-mono text-gray-300">A S D F G H J</span></p>
          <p className="text-gray-500">Black keys: <span className="font-mono text-gray-300">W E T Y U</span></p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-400 font-medium">Keyboard Controls - Higher Octave (C5-B5):</p>
          <p className="text-gray-500">White keys: <span className="font-mono text-gray-300">K L ; &apos; Z X C</span></p>
          <p className="text-gray-500">Black keys: <span className="font-mono text-gray-300">O P</span></p>
        </div>
      </div>
    </div>
  );
}
