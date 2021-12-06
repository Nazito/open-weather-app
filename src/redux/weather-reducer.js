import { weatherAPI } from "../api/api";
import { geolocationAPI } from "../api/api";

const SET_UNITS = "SET_UNITS";
const REMOVE_WEATHER_CARD = "REMOVE_WEATHER_CARD";
const ADD_WEATHER_ITEM = "ADD_WEATHER_ITEM";
const SET_WEATHER_LIST = "SET_WEATHER_LIST";

let initialState = {
  weatherList: [],
  units: null,
};

const weatherReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEATHER_LIST:
      return {
        ...state,
        weatherList: [...action.payload],
      };
    case ADD_WEATHER_ITEM:
      return {
        ...state,
        weatherList: [...state.weatherList, action.payload],
      };

    case REMOVE_WEATHER_CARD:
      return {
        ...state,
        weatherList: [...state.weatherList].filter(
          (item) => item.id !== action.payload
        ),
      };

    case SET_UNITS:
      let newList = state.weatherList.map((item) => {
        if (item.id === action.payload.id) {
          return action.payload;
        } else {
          return item;
        }
      });

      return {
        ...state,
        weatherList: newList,
      };

    default:
      return state;
  }
};

export const setWeatherList = (payload) => ({
  type: SET_WEATHER_LIST,
  payload,
});

export const addWeatherItem = (payload) => ({
  type: ADD_WEATHER_ITEM,
  payload,
});

export const setUnitsCard = (payload) => ({
  type: SET_UNITS,
  payload,
});

export const removeWeatherCard = (payload) => ({
  type: REMOVE_WEATHER_CARD,
  payload,
});

export const getWeatherDataListThunk = (paramsList) => async (dispach) => {
  const weatherDataList = await Promise.all(
    paramsList.map((params) => {
      return getWeatherData(params);
    })
  );

  dispach(setWeatherList(weatherDataList));
};

export const getWeatherDataThunk = (params) => async (dispach) => {
  const weatherData = await getWeatherData(params);
  dispach(addWeatherItem(weatherData));
};

const getWeatherData = (params) => {
  return Promise.all([
    weatherAPI.getWeather(params.lat, params.lng, params.units, params.lang),
    geolocationAPI.getLocationCity(params.lat, params.lng, params.lang),
  ]).then(([responseWeather, responseGeo]) => {
    return {
      weatherData: responseWeather.data,
      geoData: responseGeo.data,
      id: params.id,
      units: params.units,
    };
  });
};

export const getUnitsThunk = (lat, lng, units, id) => {
  return async (dispach) => {
    try {
      let responseWeather = await weatherAPI.getWeather(lat, lng, units);
      let responseGeo = await geolocationAPI.getLocationCity(lat, lng);
      dispach(
        setUnitsCard({
          weatherData: responseWeather.data,
          geoData: responseGeo.data,
          id: id,
          units: units,
        })
      );
    } catch (e) {
      console.log(e.response.data.message);
    }
  };
};

export default weatherReducer;
