export const TOGGLE_PLAY = '@GRID/TOGGLE_PLAY';
export const SET_TEMPO = '@GRID/SET_TEMPO';

export const togglePlay = () => ({
  type: TOGGLE_PLAY,
});
export const setTempo = (tempo) => ({
  type: SET_TEMPO,
  payload: { tempo }
});
