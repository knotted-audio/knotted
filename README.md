# knotted

Looping software for the web

## TODOs

- Split audioScheduler into 3 modules:
  > audioUtils (record, trigger helpers etc)
  > audioScheduler middleware (setTimeout based scheduling so background tab issue goes away)
  > visualScheduler middleware (raf based animations)

- Try a version based on Tone.js
  https://codepen.io/jakealbaugh/pen/QVqgBE

--- Think about midi inputs!
- Multiplier button/hotkey
- Undo button/hotkey
- Record on/off hotkey (reverses the undo button functionality.. When recording it discards, when not recording it keeps it)

- Circle countdown for the loop duration


- Apply changes to state to audio scheduler at the start of each loop (configurable length)

- Animate cursor on each loop

- Move audio processing to worker thread as much as possible

- hotkeys? number of loop followed by beat number (with hotkey for cancel in case of mistakes)

- Trigger stuff with MIDI input (keyboard or sample pad)

## Research

### WebAudio

Tutorial for schedulers in WebAudio

- https://www.html5rocks.com/en/tutorials/audio/scheduling/

Tutorials on using a wasm AudioWorkletNode

- https://googlechromelabs.github.io/web-audio-samples/audio-worklet/

Research paper on WebAudio processing tools for live coding

- https://www.ntnu.edu/documents/1282113268/1290797448/WAC2019-CameraReadySubmission-40.pdf/12d96b25-63f4-f1e6-6b3f-b761031a9316?t=1575329716181

### WebMIDI

WebMIDI Wrapper lib

- https://github.com/djipco/webmidi

### Rust

Web-based DAW written in Rust/WebAssembly and TypeScript

- https://github.com/ameobea/web-synth/
- https://cprimozic.net/projects/notes/

Someone experimenting with Rust + wasm + webaudio

- https://github.com/the-drunk-coder/ruffbox
- https://github.com/the-drunk-coder/wasm-loop-player
