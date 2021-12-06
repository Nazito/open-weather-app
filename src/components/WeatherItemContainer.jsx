import React, { useEffect } from "react";
import WeatherCardItem from "./WeatherCardItem";
import { connect } from "react-redux";
import { getLocationThunk } from "../redux/geolocation-reducer";
// import { getWeatherThunk } from "../redux/weather-reducer";

const WeatherItemContainer = (props) => {
  useEffect(() => {
    props.getLocationThunk(props.lat, props.lng);
    // props.getWeatherThunk(props.lat, props.lng)

    console.log("rrr", props.weatherItem);
  }, []);

  return (
    <WeatherCardItem
      order={props.index}
      // item={item}
      locality={props.locality}
      weather={props.weather}
      hourses={props.hourses}
      tempHourly={props.tempHourly}
      tempMax={props.tempMax}
      tempMin={props.tempMin}
      palette={props.palette}
    />
  );
};

let mapStateToProps = (state) => {
  return {
    locality: state.geolocationReducer.locality,
    weather: state.weatherReducer.weather,
    hourses: state.weatherReducer.hourses,
    tempHourly: state.weatherReducer.tempHourly,
    tempMax: state.weatherReducer.max,
    tempMin: state.weatherReducer.min,
    palette: state.weatherReducer.palette,

    weatherItem: state.weatherReducer.weatherItem,
  };
};

export default connect(mapStateToProps, {
  getLocationThunk,
  // getWeatherThunk
})(WeatherItemContainer);
