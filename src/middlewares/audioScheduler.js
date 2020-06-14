//
// Middleware that handles scheduling all the active loops to play at the correct times. It
// reacts to changes in the redux state while maintaining a consistent beat.
//

import { TOGGLE_PLAY } from "../actions/grid";
import { createLoop, setLoopStartTime } from "../actions/loop";
import { getMidiTracks} from "../reducers/loopReducer";

import { getAudioCtx, triggerMetronome, triggerMidi, triggerLoopsAtBeat, recordInputStream } from "../audioUtils";

const SCHEDULE_AHEAD_TIME = 0.1;
const TIMEOUT_DUR = 20;

const audioScheduler = (store) => (next) => {
  let frame = null;
  let nextNoteTime;
  let nextBeat;

  const loop = () => {
    const audioCtx = getAudioCtx();
    const state = store.getState();
    const {
      mediaStream,

      quantizationMidi,

      playing,
      metronome,
      tempo,
      grid,
      gain,
      beats,
      beatsPerBar,
      loopLength,
    } = state.grid;
    const { loops, loopDuration, loopStartTime } = state.loop;
    const secondsPerBeat = 60.0 / tempo;

    try {
      const cTime = audioCtx.currentTime;

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

        triggerMidi(
          getMidiTracks(),
          beats,
          secondsPerBeat,
          quantizationMidi,
          nextBeat,
          nextNoteTime,
          loopDuration,
          loopStartTime
        );

        // At this point, we lock in the current state in redux as what audio will be scheduled
        // regardless of user changes.
        if (nextBeat % loopLength === 0) {
          const loopStart = nextNoteTime;
          const loopEnd = nextNoteTime + loopLength * secondsPerBeat;

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
      frame = setTimeout(loop, TIMEOUT_DUR);
    }
  };

  return (action) => {
    // We need to track 2 versions of the state:
    //
    // 1. UI state (immediately updated on each user action)
    // 2. Audio state (updated at the start of each quantization loop)

    next(action);
    const state = store.getState();
    const {
      tempo,
      loopLength,
    } = state.grid;
    const secondsPerBeat = 60.0 / tempo;
    const loopDuration = secondsPerBeat * loopLength;

    // If the playing state has been toggled, start or stop the Raf loop
    if (action.type === TOGGLE_PLAY && store.getState().grid.playing) {
      const audioCtx = window.audioCtx || new AudioContext();
      window.audioCtx = audioCtx;

      nextBeat = 0;
      nextNoteTime = audioCtx.currentTime + SCHEDULE_AHEAD_TIME;
      store.dispatch(setLoopStartTime(nextNoteTime, loopDuration));
      frame = setTimeout(loop, TIMEOUT_DUR);
    } else if (action.type === TOGGLE_PLAY && frame) {
      clearTimeout(frame);
      nextBeat = 0;
    }
  };
};

export default audioScheduler;
