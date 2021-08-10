import { weatherAPI } from "../api/api";
import { geolocationAPI } from "../api/api";

const SET_WEATHER = "SET_WEATHER";
// const SET_TEMP = "SET_TEMP";
// const GET_MIN = "GET_MIN";
// const GET_MAX = "GET_MAX";
const SET_UNITS = "SET_UNITS";
const REMOVE_WEATHER_CARD = "REMOVE_WEATHER_CARD";
const SET_WEATHER_LIST = "SET_WEATHER_LIST";

let initialState = {
    weatherList: [],
    units: null
};

const weatherReducer = (state = initialState, action) => {
    switch (action.type) {
      case SET_WEATHER_LIST:
        debugger
          return {
            ...state,
            weatherList:[...state.weatherList, action.payload] 
          };
        
      case REMOVE_WEATHER_CARD:
        return {
          ...state,
          weatherList: [...state.weatherList].filter(item => item.id !== action.payload) 
        };

      case SET_UNITS:

        let newList = state.weatherList.map( item => {

          // let erer = item.weatherData.current.temp
          // debugger
          if( item.id === action.payload.id ){
             
            return action.payload
          }else{
            return item
          }
        }) 

        debugger
        
        return {
          ...state,
          weatherList: newList

          
        };

        
        
      default:
        return state;
    }
};







export const setWeatherList = (payload) => ({
  type: SET_WEATHER_LIST,
  payload,
});

export const setUnitsCard = (payload) => ({
  type: SET_UNITS,
  payload
});

export const removeWeatherCard = (payload) => ({
  type: REMOVE_WEATHER_CARD,
  payload
});

// export const setTempHourly = (payload) => ({
//   type: SET_TEMP,
//   payload,
// });


// export const getMinTemp = (payload) => ({
  //   type: GET_MIN,
  //   payload,
  // });
  
  // export const setPalette = (payload) => ({
    //   type: SET_PALETTE,
    //   payload,
    // });
    

export const getWeatherDataThunk = (params) => async (dispach) => {
    return Promise.all([
    weatherAPI.getWeather(params.lat, params.lng, params.units),
    geolocationAPI.getLocationCity(params.lat, params.lng)])
    .then(([responseWeather, responseGeo]) => {
      dispach(setWeatherList({
        weatherData: responseWeather.data,
        geoData: responseGeo.data,
        id: params.id,
        units: params.units
      }))
    })  
};




export const getUnitsThunk = (lat, lng, units, id) => {
  return async (dispach) => {
    try{
      let responseWeather = await weatherAPI.getWeather(lat, lng, units);
      let responseGeo = await geolocationAPI.getLocationCity(lat, lng);
      // dispach(setUnitsCard(id, response.data))
      dispach(setUnitsCard({
        weatherData: responseWeather.data,
        geoData: responseGeo.data,
        id: id,
        units: units
      }))
      debugger
    }catch(e){
      // debugger
      // console.log(e.response.data.message)
    }
  };
};






export default weatherReducer;
