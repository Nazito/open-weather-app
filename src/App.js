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
  useEffect(() => {
    const userLocationData = JSON.parse(localStorage.getItem("userLocation"));
    const params = JSON.parse(localStorage.getItem("params")) || [];

    if (userLocationData === null && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userGeoParams = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            units: "metric",
            lang: localStorage.getItem("i18nextLng"),
            id: Date.now(),
          };

          const nextParams = [...params, userGeoParams];
          localStorage.setItem("params", JSON.stringify(nextParams));
          localStorage.setItem("userLocation", JSON.stringify(true));
          props.getWeatherDataListThunk(nextParams);
        },
        () => {
          localStorage.setItem("userLocation", JSON.stringify(false));
          props.getWeatherDataListThunk(params);
        }
      );
    } else {
      props.getWeatherDataListThunk(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
