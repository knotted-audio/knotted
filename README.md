# knotted

Looping software for the web

## TODOs

- Split gridReducer into:
  - appReducer (tempo, loopLength, metronome, playing, gain) // changed while performing
  - configReducer (noteMapping, midiDevices, audioDevices, mediaStream, beatsPerBar, beats) // configured before performing
  - gridReducer (grid) // actually the grid

- Improve UI:
 * Circle countdown for the loop duration
 * Animate cursor on each loop

- Add tuna.js effects? https://github.com/Theodeus/tuna

- Apply changes to state to audio scheduler at the start of each loop (configurable length)

- More MIDI commands


## Research

### WebAudio

Tutorials on using a wasm AudioWorkletNode

- https://googlechromelabs.github.io/web-audio-samples/audio-worklet/

Research paper on WebAudio processing tools for live coding

- https://www.ntnu.edu/documents/1282113268/1290797448/WAC2019-CameraReadySubmission-40.pdf/12d96b25-63f4-f1e6-6b3f-b761031a9316?t=1575329716181

### Rust

Web-based DAW written in Rust/WebAssembly and TypeScript

- https://github.com/ameobea/web-synth/
- https://cprimozic.net/projects/notes/

Someone experimenting with Rust + wasm + webaudio

- https://github.com/the-drunk-coder/ruffbox
- https://github.com/the-drunk-coder/wasm-loop-player
