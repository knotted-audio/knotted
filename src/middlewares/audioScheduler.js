//
// Middleware that handles scheduling all the active loops to play at the correct times. It
// reacts to changes in the redux state while maintaining a consistent beat.
//
// TODO: Similar version of this for "real-time" DOM updates of the grid & loop cursors based
//       on the beat. We want to avoid using React's reconciler for this as it schedules updates
//       for a later point when we want to prioritise frame-level precision of which grid square
//       is lit up
//
const SCHEDULE_AHEAD_TIME = 0.1;
const BLIP_LENGTH = 0.01;

const audioScheduler = (store) => (next) => {
  const audioCtx = new AudioContext();
  let frame = null;
  let nextNoteTime = audioCtx.currentTime;
  let nextBeat = 0;

  function loop() {
    const state = store.getState();
    const {
      playing,
      playMetronome,
      tempo,
      grid,
      gain,
      beats,
      beatsPerBar,
      // quantizationBeats,
    } = state.grid;
    const { loops } = state.loop;
    const secondsPerBeat = 60.0 / tempo;

    function triggerMetronome(b, time) {
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

    try {
      const cTime = audioCtx.currentTime;

      //
      // TODO: Increase grid resolution to be 1/16 of each bar
      //
      if (playing && nextNoteTime < cTime + SCHEDULE_AHEAD_TIME) {
        // Get notes at "nextBeat" and schedule them to play in the webAudio audioCtx
        const { loopTriggers } = grid[nextBeat % beats];

        loopTriggers
          .map((id) => loops.find((l) => l.id === id))
          .forEach((loop) => {
            const source = audioCtx.createBufferSource();

            // set the buffer in the AudioBufferSourceNode
            source.buffer = loop.buffer;

            // start the source playing
            const gainNode = audioCtx.createGain();
            gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
            source.connect(gainNode).connect(audioCtx.destination);
            source.start(nextNoteTime);
          });

        // Trigger metronome on each beat
        if (playMetronome) {
          triggerMetronome(nextBeat, nextNoteTime);
        }

        nextBeat += 1;

        // Set the next target to schedule for
        nextNoteTime += secondsPerBeat / 4.0;
      }
    } finally {
      frame = requestAnimationFrame(loop);
    }
  }

  return (action) => {
    // We need to track 2 versions of the state:
    //
    // 1. UI state (immediately updated on each user action)
    // 2. Audio state (updated at the start of each quantization loop)

    next(action);

    // If the playing state has been toggled, start or stop the Raf loop
    if (store.getState().grid.playing) {
      frame = requestAnimationFrame(loop);
    } else if (frame) {
      cancelAnimationFrame(frame);
    }
  };
};

export default audioScheduler;
