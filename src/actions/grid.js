export const TOGGLE_PLAY = '@GRID/TOGGLE_PLAY';
export const TOGGLE_METRONOME = '@GRID/TOGGLE_METRONOME';
export const SET_TEMPO = '@GRID/SET_TEMPO';
export const SET_GAIN = '@GRID/SET_GAIN';
export const SET_ACTIVE_LOOP = '@GRID/SET_ACTIVE_LOOP';
export const SET_GRID_ELEM = '@GRID/SET_GRID_ELEM';
export const ADD_LOOP_INSTANCE = '@GRID/ADD_LOOP_INSTANCE';

export const addLoopInstance = (beat, loopId) => ({
  type: ADD_LOOP_INSTANCE,
  payload: { beat, loopId }
});
export const togglePlay = () => ({
  type: TOGGLE_PLAY,
});
export const toggleMetronome = () => ({
  type: TOGGLE_METRONOME,
});
export const setActiveLoop = (loopId) => ({
  type: SET_ACTIVE_LOOP,
  payload: { loopId }
});
export const setGain = (gain) => ({
  type: SET_GAIN,
  payload: { gain }
});
export const setTempo = (tempo) => ({
  type: SET_TEMPO,
  payload: { tempo }
});
export const setGridElem = (index, domElem) => ({
  type: SET_GRID_ELEM,
  payload: { index, domElem }
});
