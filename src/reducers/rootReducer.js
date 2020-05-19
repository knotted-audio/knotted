import { combineReducers } from "redux";
import loopReducer from "./loopReducer";
import gridReducer from "./gridReducer";

export default combineReducers({
  loop: loopReducer,
  grid: gridReducer,
});
