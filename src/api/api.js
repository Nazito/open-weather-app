import * as axios from "axios";

//===================================== configs
let axiosWeatherConfig = {
    key: '97b623f9f087c14f8f7c5c3dd0fdaa8f',
    baseURL: 'https://api.openweathermap.org/data/2.5/',
    headers : {
      'Content-Type': 'application/json'
    }
}

let axiosPlacesConfig = {
    key: 'AIzaSyD27IdH61prZPK9Mjy9Mlhj4ZgqBKEuCmM',
    baseURL: 'https://maps.googleapis.com/maps/api/',
    headers : {
      'Content-Type': 'application/json'
    }
}

// ======================== weather ========================
export const weatherAPI = {
  getWeather(lat, lng, units) {
    debugger
    return axios.get(`onecall?lat=${lat}&lon=${lng}&units=${units}&APPID=${axiosWeatherConfig.key}`, axiosWeatherConfig);
  }
}

// ======================== geo ========================
export const geolocationAPI = {
    getLocationCity(lat, lng) {
      return axios.get(`geocode/json?latlng=${lat},${lng}&key=${axiosPlacesConfig.key}&sensor=false&language=en`, axiosPlacesConfig);  
    }
}