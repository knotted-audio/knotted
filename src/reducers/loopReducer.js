import { CREATE_LOOP } from "../actions/loop";

const initialState = {
  loops: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_LOOP:
      // TODO: Limit to 10 loops (need to save the ones that are instantiated on the grid
      return {
        ...state,
        loops: [action.payload, ...state.loops],
      };
    default:
      return state;
  }
};
