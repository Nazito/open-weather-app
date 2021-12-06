import React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import "./App.css";
import {
  getWeatherDataThunk,
  removeWeatherCard,
  getUnitsThunk,
  getWeatherDataListThunk,
} from "./redux/weather-reducer";
import WeatherList from "./components/WeatherList";
import WeatherHeader from "./components/WeatherHeader";

const WeatherApp = (props) => {
  console.log("render");
  useEffect(() => {
    // localStorage.setItem('userLocation', JSON.stringify(null))
    let userLocationData = JSON.parse(localStorage.getItem("userLocation"));
    let params = JSON.parse(localStorage.getItem("params")) || [];
    let userGeoParams;
    if (userLocationData === null && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        userGeoParams = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          units: "metric",
          lang: localStorage.getItem("i18nextLng"),
          id: Date.now(),
        };

        params.push(userGeoParams);
        localStorage.setItem("params", JSON.stringify(params));
        localStorage.setItem("userLocation", JSON.stringify(true));

        props.getWeatherDataListThunk(params);
      });
    } else {
      if (userGeoParams) {
        params.push(userGeoParams);
        localStorage.setItem("params", JSON.stringify(params));
      }

      props.getWeatherDataListThunk(params);

      // params.reduce((promise, item) => {
      //   return promise.then(() => props.getWeatherDataThunk(item))
      // }, Promise.resolve());
    }
  }, []);

  return (
    <div className="weatherApp">
      <div className="container">
        {/* <h2>{t('welcome_to_react')}</h2> */}
        <WeatherHeader
          getWeatherDataThunk={props.getWeatherDataThunk}
          getWeatherDataListThunk={props.getWeatherDataListThunk}
        />
        <main>
          <div className="mainWrap">
            <WeatherList
              weatherList={props.weatherList}
              removeWeatherCard={props.removeWeatherCard}
              getUnitsThunk={props.getUnitsThunk}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

let mapStateToProps = (state) => {
  return {
    weatherList: state.weatherReducer.weatherList,
  };
};

export default connect(mapStateToProps, {
  getWeatherDataListThunk,
  removeWeatherCard,
  getUnitsThunk,
  getWeatherDataThunk,
})(WeatherApp);
