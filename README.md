# knotted

Looping software for the web

## TODOs

- Module that can take the redux store and render the loop. Needs to handle:
  > quantizing (only put changes into effect at the next time round - configurable length)
  > Reliable scheduling of notes in advance
  > Recording of live inputs into loops
  > RAF callback directly updating the css classes to control the beat-related changes (grid lighting up, cursors on
    loops)

- Get a global metronome/scheduler going
  > How to represent in Redux state... Needs to integrate with audio and visual parts of app
  > Highlight beat on grid
  > Add cursor to loop (multiple per loop depending on number of instantiations)
  > Trigger click on each beat
  > Triggered by user interaction on play button

- Add ability to drag a loop onto the grid + remove from grid
  > hotkeys? number of loop followed by beat number (with hotkey for cancel in case of mistakes)

- Indicate loop length in Loop panel


## Research


### React

- https://github.com/klambycom/react-waveform
- https://github.com/Ameobea/react-control-panel
- https://www.react-spring.io/docs/hooks/basics
- SVG or React DnD for grid?

### WebAudio

Tutorial for schedulers in WebAudio

- https://www.html5rocks.com/en/tutorials/audio/scheduling/

Google Drum Machine App

- https://experiments.withgoogle.com/ai/drum-machine/view/
- https://github.com/googlecreativelab/aiexperiments-drum-machine

Loop-drop core libraries

- https://github.com/mmckegg/audio-slot -> It allows you to declaratively describe a Web Audio API node
   setup using JSON, then push in a new state and then only update the AudioParams that have changed.
   Basically react for Web Audio.

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
