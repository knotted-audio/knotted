# knotted

Looping software for the web

## TODOs

- Apply changes to state to audio scheduler at the start of each loop (configurable length)
- Animate cursor on each loop

- Move audio processing to worker thread as much as possible

- hotkeys? number of loop followed by beat number (with hotkey for cancel in case of mistakes)

- Trigger stuff with MIDI input (keyboard or sample pad)

## Research

### WebAudio

Tutorial for schedulers in WebAudio

- https://www.html5rocks.com/en/tutorials/audio/scheduling/

Google Drum Machine App

- https://experiments.withgoogle.com/ai/drum-machine/view/
- https://github.com/googlecreativelab/aiexperiments-drum-machine

Tutorials on using a wasm AudioWorkletNode

- https://googlechromelabs.github.io/web-audio-samples/audio-worklet/

### WebMIDI

WebMIDI Wrapper lib

- https://github.com/djipco/webmidi

Redux-centric Synth with a "WebAudioReconciler" and "WebAudioManager" which look well thought through. No looping in the app though

- https://github.com/joshwcomeau/key-and-pad

### Rust

Web-based DAW written in Rust/WebAssembly and TypeScript

- https://github.com/ameobea/web-synth/
- https://cprimozic.net/projects/notes/

Someone experimenting with Rust + wasm + webaudio

- https://github.com/the-drunk-coder/ruffbox
- https://github.com/the-drunk-coder/wasm-loop-player
