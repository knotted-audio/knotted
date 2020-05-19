export const CREATE_LOOP = '@GRID/CREATE_LOOP';

export const createLoop = (buffer) => ({
  type: CREATE_LOOP,
  payload: {
    buffer,
    color: "#FF4136", // TODO: Randomise from preset list
    id: "MGMGM", // TODO: Randomise
  }
});
