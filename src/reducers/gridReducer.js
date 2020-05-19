import { TOGGLE_PLAY, SET_TEMPO } from '../actions/grid';

const initialState = {
  beatsPerBar: 4,
  beats: 16,
  playing: false,
  playMetronome: true,
  tempo: 80,
  quantizationBeats: 4,
  gain: 0.2,

  grid: generateGrid(16, 4)
};

// TODO: Seemless switching betweeen resolutions - different state per view

function generateGrid(beats, beatsPerBar) {
  return [...Array(beats).keys()].map((beat) => {
    const barBeat = (beat + 1) % beatsPerBar;

    return {
      beat: beat + 1,
      barBeat,
      loopTriggers: (beat + 1) % 8 === 1 ? ['ABCED'] : []
    };
  });
}

export default (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_PLAY:
      return {
        ...state,
        playing: !state.playing
      };
    case SET_TEMPO:
      return {
        ...state,
        tempo: action.payload.tempo,
      };
    default:
      return state;
  }
};
