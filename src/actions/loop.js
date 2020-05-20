import { v4 as uuidv4 } from "uuid";
import randomColor from "randomcolor";
export const CREATE_LOOP = "@GRID/CREATE_LOOP";

export const createLoop = (buffer) => ({
  type: CREATE_LOOP,
  payload: {
    buffer,
    color: randomColor(),
    id: uuidv4(),
  },
});
