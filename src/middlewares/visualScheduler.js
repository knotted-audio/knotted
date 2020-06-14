//
// Middleware that manages DOM updates of the grid & loop cursors based on the beat. We avoid
// using React's reconciler for this as it schedules updates for a later point when we want
// to prioritise frame-level precision of which grid square is lit up
//

import { TOGGLE_PLAY } from "../actions/grid";
import { getAudioCtx } from "../audioUtils";

const SCHEDULE_AHEAD_TIME = 0.1;
const ANIMATION_TOLERANCE = -0.05;

const visualScheduler = (store) => (next) => {
  let frame = null;

  let nextGridChangeTime;
  let nextGridBeat;

  const loop = () => {
    const audioCtx = getAudioCtx();
    const state = store.getState();
    const { playing, tempo, beats } = state.grid;
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
    } finally {
      // TODO Take into account that multiple beats can be missed before the loop will resume
      //      as the audio scheduler will continue and we need to stay in sync with it
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

      nextGridBeat = 0;
      nextGridChangeTime = audioCtx.currentTime + SCHEDULE_AHEAD_TIME;
      frame = requestAnimationFrame(loop);
    } else if (action.type === TOGGLE_PLAY && frame) {
      window.gridElems.forEach((elem) => elem.classList.remove("active"));
      cancelAnimationFrame(frame);
    }
  };
};

export default visualScheduler;
