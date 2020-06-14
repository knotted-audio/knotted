import { createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers/rootReducer";

import audioScheduler from "./middlewares/audioScheduler";
import visualScheduler from "./middlewares/visualScheduler";
import midiListener from "./middlewares/midiListener";

export default function configureStore(initialState = {}) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(audioScheduler, visualScheduler, midiListener)
  );
}
