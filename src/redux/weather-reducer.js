import { weatherAPI, geolocationAPI } from "../api/api";

const SET_UNITS = "SET_UNITS";
const REMOVE_WEATHER_CARD = "REMOVE_WEATHER_CARD";
const ADD_WEATHER_ITEM = "ADD_WEATHER_ITEM";
const SET_WEATHER_LIST = "SET_WEATHER_LIST";
const REORDER_WEATHER_LIST = "REORDER_WEATHER_LIST";

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
        weatherList: [action.payload, ...state.weatherList],
      };

    case REMOVE_WEATHER_CARD:
      return {
        ...state,
        weatherList: [...state.weatherList].filter(
          (item) => item.id !== action.payload
        ),
      };

    case SET_UNITS: {
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
    }

    case REORDER_WEATHER_LIST: {
      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.weatherList.length ||
        toIndex >= state.weatherList.length
      ) {
        return state;
      }

      const nextList = [...state.weatherList];
      const [moved] = nextList.splice(fromIndex, 1);
      nextList.splice(toIndex, 0, moved);

      return {
        ...state,
        weatherList: nextList,
      };
    }

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

export const reorderWeatherList = (fromIndex, toIndex) => ({
  type: REORDER_WEATHER_LIST,
  payload: { fromIndex, toIndex },
});

export const reorderWeatherCards = (fromIndex, toIndex) => (
  dispatch,
  getState
) => {
  if (fromIndex === toIndex) return;

  dispatch(reorderWeatherList(fromIndex, toIndex));

  const orderedCards = getState().weatherReducer.weatherList;
  const params = JSON.parse(localStorage.getItem("params")) || [];
  const paramsById = params.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  const nextParams = orderedCards
    .map((card) => paramsById[card.id])
    .filter(Boolean);

  if (nextParams.length === params.length) {
    localStorage.setItem("params", JSON.stringify(nextParams));
  }
};
export const getWeatherDataListThunk = (paramsList) => async (dispach) => {
  if (!paramsList || paramsList.length === 0) {
    dispach(setWeatherList([]));
    return;
  }

  try {
    const settled = await Promise.allSettled(
      paramsList.map((params) => getWeatherData(params))
    );

    const weatherDataList = settled
      .map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        }
        console.error("Failed to load weather card:", paramsList[index], result.reason);
        return null;
      })
      .filter(Boolean);

    dispach(setWeatherList(weatherDataList));
  } catch (error) {
    console.error(error);
    dispach(setWeatherList([]));
  }
};

export const getWeatherDataThunk = (params) => async (dispach) => {
  try {
    const weatherData = await getWeatherData(params);
    dispach(addWeatherItem(weatherData));
  } catch (error) {
    console.error(error);
  }
};

const getWeatherData = async (params) => {
  const [responseWeather, responseGeo] = await Promise.all([
    weatherAPI.getWeather(params.lat, params.lng, params.units),
    geolocationAPI.getLocationCity(params.lat, params.lng, params.lang).catch(
      () => ({
        data: {
          city: params.isUserLocation ? "My location" : "Unknown",
          country: "",
        },
      })
    ),
  ]);

  return {
    weatherData: responseWeather.data,
    geoData: responseGeo.data,
    id: params.id,
    units: params.units,
    isUserLocation: Boolean(params.isUserLocation),
  };
};

export const getUnitsThunk = (lat, lng, units, id, lang) => {
  return async (dispach) => {
    try {
      let responseWeather = await weatherAPI.getWeather(lat, lng, units);
      let responseGeo = await geolocationAPI.getLocationCity(lat, lng, lang);
      dispach(
        setUnitsCard({
          weatherData: responseWeather.data,
          geoData: responseGeo.data,
          id: id,
          units: units,
        })
      );
    } catch (e) {
      console.error(e);
    }
  };
};

export default weatherReducer;
