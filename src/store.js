import { createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers/rootReducer";

import audioScheduler from "./middlewares/audioScheduler";

export default function configureStore(initialState = {}) {
  return createStore(rootReducer, initialState, applyMiddleware(audioScheduler));
}
