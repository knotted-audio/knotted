import { v4 as uuidv4 } from "uuid";

export const TOGGLE_PLAY = '@GRID/TOGGLE_PLAY';
export const TOGGLE_METRONOME = '@GRID/TOGGLE_METRONOME';
export const SET_TEMPO = '@GRID/SET_TEMPO';
export const SET_GAIN = '@GRID/SET_GAIN';
export const SET_ACTIVE_LOOP = '@GRID/SET_ACTIVE_LOOP';
export const SET_INPUT_DEVICES = '@GRID/SET_INPUT_DEVICES';
export const SET_MIDI_DEVICES = '@GRID/SET_MIDI_DEVICES';
export const SET_LOOP_LENGTH = '@GRID/SET_LOOP_LENGTH';
export const SET_MEDIA_STREAM = '@GRID/SET_MEDIA_STREAM';
export const SET_GRID_ELEM = '@GRID/SET_GRID_ELEM';
export const ADD_LOOP_INSTANCE = '@GRID/ADD_LOOP_INSTANCE';
export const TRIGGER_NOTE = '@GRID/TRIGGER_NOTE';

export const addLoopInstance = (beat, loopId) => ({
  type: ADD_LOOP_INSTANCE,
  payload: { beat, loopId, instanceId: uuidv4() }
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
export const setLoopLength = (loopLength) => ({
  type: SET_LOOP_LENGTH,
  payload: { loopLength }
});
export const setGain = (gain) => ({
  type: SET_GAIN,
  payload: { gain }
});
export const setInputDevices = (devices) => ({
  type: SET_INPUT_DEVICES,
  payload: { devices }
});
export const setMidiDevices = (devices) => ({
  type: SET_MIDI_DEVICES,
  payload: { devices }
});
export const setMediaStream = (stream) => ({
  type: SET_MEDIA_STREAM,
  payload: { stream }
});
export const setTempo = (tempo) => ({
  type: SET_TEMPO,
  payload: { tempo }
});
export const setGridElem = (index, domElem) => ({
  type: SET_GRID_ELEM,
  payload: { index, domElem }
});
export const triggerNote = (note, velocity) => ({
  type: TRIGGER_NOTE,
  payload: { note, velocity }
});
