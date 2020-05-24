import { CREATE_LOOP } from "../actions/loop";
import { ADD_LOOP_INSTANCE } from "../actions/grid";

// Loop: {
//   id,
//   createdAt,
//   buffer
// }

const initialState = {
  loops: [],
  loopsInUse: [],
};

const MAX_LOOPS = 3;

export default (state = initialState, action) => {
  switch (action.type) {
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
      // let loops = [...state.loops];
      // loops = loops.map(loop => {
      //   if (loop.id === action.payload.loopId) {
      //     loop.isBeingUsed = true;
      //   }
      //   return loop;
      // });
      //
      // console.log(loops, action.payload);

      return {
        ...state,
        loopsInUse: [...state.loopsInUse, action.payload.loopId],
      };
    }
    default:
      return state;
  }
};
