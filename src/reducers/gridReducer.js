import {
  TOGGLE_PLAY,
  TOGGLE_METRONOME,
  SET_ACTIVE_LOOP,
  SET_GAIN,
  SET_TEMPO,
  SET_LOOP_LENGTH,
  SET_INPUT_DEVICES,
  SET_MIDI_DEVICES,
  SET_MEDIA_STREAM,
  SET_GRID_ELEM,
  ADD_LOOP_INSTANCE,
} from "../actions/grid";

window.gridElems = [];

const initialState = {
  beatsPerBar: 4,
  beats: 16,
  playing: false,
  recordingMidi: true,
  metronome: true,
  tempo: 136.55,
  loopLength: 8,
  quantizationBeats: 4,
  quantizationMidi: 0.25, // quarter note
  gain: 0.2,

  // The highlighted loop that will be added to the grid when its clicked
  activeLoop: null,

  activeMidiDevice: null,
  midiDeviceList: [],

  activeInputDevice: null,
  inputDeviceList: [],
  mediaStream: null,

  grid: generateGrid(16, 4),
};

// TODO: Seemless switching betweeen resolutions - different state per view

function generateGrid(beats, beatsPerBar) {
  return [...Array(beats).keys()].map((beat) => {
    const barBeat = (beat + 1) % beatsPerBar;

    return {
      beat: beat + 1,
      barBeat,
      loopTriggers: [],
    };
  });
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_GRID_ELEM:
      // Mutate in place as these are opaque refs
      window.gridElems[action.payload.index - 1] = action.payload.domElem;
      return state;
    case ADD_LOOP_INSTANCE:
      const grid = [...state.grid];
      const gridItem = grid[action.payload.beat - 1];
      gridItem.loopTriggers.push({
        id: action.payload.loopId,
        instanceId: action.payload.instanceId,
      });

      return {
        ...state,
        grid,
      };
    case TOGGLE_METRONOME:
      return {
        ...state,
        metronome: !state.metronome,
      };
    case TOGGLE_PLAY:
      return {
        ...state,
        playing: !state.playing,
      };
    case SET_ACTIVE_LOOP:
      return {
        ...state,
        activeLoop: action.payload.loopId,
      };
    case SET_GAIN:
      return {
        ...state,
        gain: action.payload.gain,
      };
    case SET_LOOP_LENGTH:
      return {
        ...state,
        loopLength: action.payload.loopLength,
      };
    case SET_MIDI_DEVICES:
      return {
        ...state,
        midiDeviceList: action.payload.devices,
      };
    case SET_INPUT_DEVICES:
      return {
        ...state,
        inputDeviceList: action.payload.devices,
      };
    case SET_MEDIA_STREAM:
      return {
        ...state,
        mediaStream: action.payload.stream,
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
