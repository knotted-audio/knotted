import { CREATE_LOOP, RECORD_MIDI_NOTE, SET_LOOP_START_TIME } from "../actions/loop";
import { ADD_LOOP_INSTANCE } from "../actions/grid";

// Loop: {
//   id,
//   createdAt,
//   buffer
// }

const initialState = {
  loops: [],
  loopsInUse: [],

  activeMidiTrack: 0,
  loopStartTime: 0,
  loopDuration: 0,
};

const MAX_LOOPS = 5;
const midiTracks = [...Array(MAX_LOOPS).keys()].map(() => ({ muted: false, timeline: {} }));

export function getMidiTracks() {
  return midiTracks;
}

export default (state = initialState, action) => {
  switch (action.type) {
    case RECORD_MIDI_NOTE: {
      const { triggerTime, engine } = action.payload;
      const { timeline } = midiTracks[state.activeMidiTrack];

      // Determine the offset from the start of the loop it was recorded in. This allows us
      // to replay it at the right time in subsequent loops and quantize it
      const secondsIntoLoop = (triggerTime - state.loopStartTime) % state.loopDuration;

      const timesliceInTrack = timeline[secondsIntoLoop] || [];
      timesliceInTrack.push(engine);
      timeline[secondsIntoLoop] = timesliceInTrack;
      
      // Don't actually change the redux state
      return {
        ...state,
      }
    }

    case SET_LOOP_START_TIME: {
      return {
        ...state,
        loopStartTime: action.payload.loopStartTime,
        loopDuration: action.payload.loopDuration,
      }
    }

    case CREATE_LOOP: {
      let loops = [...state.loops];

      const createdAt = Date.now();
      if (loops.length < MAX_LOOPS) {
        loops = [...loops, { ...action.payload, createdAt }];
        return {
          ...state,
          loops,
        };
      }

      //
      // We want the following properties:
      //
      //  - index of each loop remains stable
      //  - list of loops is bounded (for screen space and memory reasons)
      //  - the oldest loop is the one removed first
      //  - loops used on the grid cant be removed
      //
      const [oldestUnused, indexOfOldestUnused] = loops.reduce(
        ([oldest, indexOfOldest], other, index) => {
          // Early return if the loop is used on the grid
          const inUse = state.loopsInUse.indexOf(other.id) > -1;
          if (inUse) {
            return [oldest, indexOfOldest];
          }

          // If there is no other candidate, return the loop
          if (oldest === null) {
            return [other, index];
          }

          // If oldest is newer than the candidate, return the candidate
          if (oldest.createdAt > other.createdAt) {
            return [other, index];
          }

          return [oldest, indexOfOldest];
        },
        [null, -1]
      );

      if (indexOfOldestUnused > -1) {
        loops[indexOfOldestUnused] = { ...action.payload, createdAt };
      } else {
        console.log("No space!");
        // Alert the user there is no space in the buffer somehow?
      }

      return {
        ...state,
        loops,
      };
    }
    case ADD_LOOP_INSTANCE: {
      return {
        ...state,
        loopsInUse: [...state.loopsInUse, action.payload.loopId],
      };
    }
    default:
      return state;
  }
};
