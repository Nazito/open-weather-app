
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import weatherReducer from "./weather-reducer";
import geolocationReducer from "./geolocation-reducer.js";
import thunkMiddleware from "redux-thunk";



let redusers = combineReducers({
    weatherReducer,
    geolocationReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  redusers,
  /* preloadedState, */ composeEnhancers(applyMiddleware(thunkMiddleware))
);

window.store = store;

export default store;
