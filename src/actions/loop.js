import { v4 as uuidv4 } from "uuid";
import randomColor from "randomcolor";
export const CREATE_LOOP = "@GRID/CREATE_LOOP";
export const RECORD_MIDI_NOTE = "@GRID/RECORD_MIDI_NOTE";
export const SET_LOOP_START_TIME = "@GRID/SET_LOOP_START_TIME";

export const createLoop = (buffer) => ({
  type: CREATE_LOOP,
  payload: {
    buffer,
    color: randomColor(),
    id: uuidv4(),
  },
});

export const setLoopStartTime = (loopStartTime, loopDuration) => ({
  type: SET_LOOP_START_TIME,
  payload: {
    loopStartTime,
    loopDuration
  },
});

export const recordMidiNote = (engine, triggerTime) => ({
  type: RECORD_MIDI_NOTE,
  payload: {
    engine,
    triggerTime,
  },
});
