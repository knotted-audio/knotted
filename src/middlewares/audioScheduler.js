//
// Middleware that handles scheduling all the active loops to play at the correct times. It
// reacts to changes in the redux state while maintaining a consistent beat.
//
// We also manage DOM updates of the grid & loop cursors based on the beat. We want to avoid
// using React's reconciler for this as it schedules updates for a later point when we want
// to prioritise frame-level precision of which grid square is lit up
//

import { TOGGLE_PLAY } from "../actions/grid";
import { createLoop } from "../actions/loop";

const SCHEDULE_AHEAD_TIME = 0.1;
const BLIP_LENGTH = 0.01;
const ANIMATION_TOLERANCE = -0.05;

function triggerMetronome(audioCtx, b, time, beats, beatsPerBar) {
  const osc = audioCtx.createOscillator();
  osc.connect(audioCtx.destination);

  if (b % beats === 0) {
    osc.frequency.value = 880.0;
  } else if (b % beatsPerBar === 0) {
    osc.frequency.value = 440.0;
  } else {
    osc.frequency.value = 220.0;
  }

  osc.start(time);
  osc.stop(time + BLIP_LENGTH);
}

function triggerLoopsAtBeat(
  grid,
  loops,
  nextBeat,
  beats,
  audioCtx,
  gain,
  nextNoteTime
) {
  const { loopTriggers } = grid[nextBeat % beats];

  loopTriggers
    .map(({ id }) => loops.find((l) => l.id === id))
    .forEach(({ buffer }) => {
      const source = audioCtx.createBufferSource();

      // set the buffer in the AudioBufferSourceNode
      source.buffer = buffer;

      // TODO: Find a better place to apply global gain
      // start the source playing
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
      source.connect(gainNode).connect(audioCtx.destination);
      source.start(nextNoteTime);
    });
}

function recordInputStream(stream, audioCtx, start, end) {
  const recorder = new MediaRecorder(stream);
  const secondsUntilEnd = end - audioCtx.currentTime;

  // This should record the full loop with a small gap at the start and end
  recorder.start((secondsUntilEnd + 2 * SCHEDULE_AHEAD_TIME) * 1000);

  // let s1, s2;
  // let e1, e2;
  //
  // s1 = audioCtx.currentTime;
  // recorder.onstart = (evt) => {
  //   s2 = evt.timeStamp / 1000;
  // };

  return new Promise(
    (resolve) =>
      (recorder.ondataavailable = (evt) => {
        // e1 = audioCtx.currentTime;
        // e2 = evt.timeStamp / 1000;

        if (recorder.state === "recording") {
          recorder.stop();
        }
        resolve(evt.data);
      })
  )
    .then((d) => d.arrayBuffer())
    .then((d) => new Promise((r, err) => audioCtx.decodeAudioData(d, r, err)))
    .then((d) => {
      // const startOffset = (s2 - s1) - SCHEDULE_AHEAD_TIME;
      // const endOffset = e2 - e1 - SCHEDULE_AHEAD_TIME;
      // const loopLength = end - start;
      // console.log(d.duration, secondsUntilEnd + 2* SCHEDULE_AHEAD_TIME, loopLength, startOffset);
      const durOffset = (d.duration - secondsUntilEnd) + SCHEDULE_AHEAD_TIME;

      const sampleRate = d.sampleRate;
      const outputAudioBuffer = audioCtx.createBuffer(1, (end - start) * sampleRate, sampleRate);

      const outB = outputAudioBuffer.getChannelData(0);
      const inB = d.getChannelData(0);
      for (let t = 0; t < (end - start) * sampleRate; t++) {
        outB[t] = inB[t + Math.floor(durOffset * sampleRate)];
      }

      return outputAudioBuffer;
    });

  // return rawRecordingP;

  // const [delay, recording] = Promise.all([startDelayP, rawRecordingP]);
  // return recording;
  // .then((d) => {
  //   const sampleRate = 44100;
  //   const outputAudioBuffer = audioCtx.createBuffer(2, (end - start) * sampleRate, sampleRate);
  //
  //   for (let channel = 0; channel < 2; channel++) {
  //     const channelBuffer = outputAudioBuffer.getChannelData(channel);
  //
  //     // for (let t = 0; t < (end - start); t++) {
  //       // channelBuffer[t] = d[channel][t
  //     // }
  //   }
  //
  //   return outputAudioBuffer;
  // });
}

const audioScheduler = (store) => (next) => {
  let frame = null;
  let nextNoteTime;
  let nextBeat;

  let nextGridChangeTime;
  let nextGridBeat;

  const loop = () => {
    const audioCtx = window.audioCtx || new AudioContext();
    window.audioCtx = audioCtx;
    const state = store.getState();
    const {
      mediaStream,

      playing,
      metronome,
      tempo,
      grid,
      gain,
      beats,
      beatsPerBar,
      quantizationBeats,
    } = state.grid;
    const { loops } = state.loop;
    const secondsPerBeat = 60.0 / tempo;

    try {
      const cTime = audioCtx.currentTime;

      //
      // Manage visual animations in real-time
      //
      if (playing && nextGridChangeTime < cTime + ANIMATION_TOLERANCE) {
        let prevBeat = nextGridBeat - 1;
        if (prevBeat === -1) {
          prevBeat = beats - 1;
        }

        window.gridElems[prevBeat].classList.remove("active");
        window.gridElems[nextGridBeat].classList.add("active");

        nextGridBeat += 1;
        nextGridBeat %= beats;
        nextGridChangeTime += secondsPerBeat;
      }

      //
      // Manage audio triggering using a look-ahead scheduler
      //
      if (playing && nextNoteTime < cTime + SCHEDULE_AHEAD_TIME) {
        // Get notes at "nextBeat" and schedule them to play in the webAudio audioCtx
        triggerLoopsAtBeat(
          grid,
          loops,
          nextBeat,
          beats,
          audioCtx,
          gain,
          nextNoteTime
        );

        // At this point, we lock in the current state in redux as what audio will be scheduled
        // regardless of user changes.
        if (nextBeat % quantizationBeats === 0) {
          const loopStart = nextNoteTime;
          const loopEnd = nextNoteTime + quantizationBeats * secondsPerBeat;

          console.log(`New loop - ${loopStart} / ${loopEnd}`);

          // Start recording the next loop
          recordInputStream(
            mediaStream,
            audioCtx,
            loopStart,
            loopEnd
          ).then((d) => store.dispatch(createLoop(d)));
        }

        // Trigger metronome on each beat
        if (metronome) {
          triggerMetronome(
            audioCtx,
            nextBeat,
            nextNoteTime,
            beats,
            beatsPerBar
          );
        }

        nextBeat += 1;
        nextBeat %= beats;
        // Set the next target to schedule for
        nextNoteTime += secondsPerBeat;
      }
    } finally {
      // TODO: Fallback to setTimeout if in background tab somehow... Otherwise I need
      // to switch the audio loop to setTimeout and keep the UI on requestAnimationFrame (and
      // take into account that multiple beats can be missed before the loop will resume)
      frame = requestAnimationFrame(loop);
    }
  };

  return (action) => {
    // We need to track 2 versions of the state:
    //
    // 1. UI state (immediately updated on each user action)
    // 2. Audio state (updated at the start of each quantization loop)

    next(action);

    // If the playing state has been toggled, start or stop the Raf loop
    if (action.type === TOGGLE_PLAY && store.getState().grid.playing) {
      const audioCtx = window.audioCtx || new AudioContext();
      window.audioCtx = audioCtx;

      nextBeat = 0;
      nextGridBeat = 0;
      nextNoteTime = audioCtx.currentTime + SCHEDULE_AHEAD_TIME;
      nextGridChangeTime = audioCtx.currentTime + SCHEDULE_AHEAD_TIME;
      frame = requestAnimationFrame(loop);
    } else if (action.type === TOGGLE_PLAY && frame) {
      window.gridElems.forEach((elem) => elem.classList.remove("active"));
      cancelAnimationFrame(frame);
    }
  };
};

export default audioScheduler;
