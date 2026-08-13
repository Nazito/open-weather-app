import React from "react";
import { useTranslation } from "react-i18next";
import WeatherCardItem from "./WeatherCardItem";

const WeatherList = (props) => {
  const { t } = useTranslation();

  if (props.weatherList.length === 0) {
    return (
      <div className="emptyState">
        <span className="emptyState__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
            <path
              d="M7.5 16.5h9.2a3.7 3.7 0 0 0 .3-7.4 5.2 5.2 0 0 0-10.1-1.2A3.8 3.8 0 0 0 7.5 16.5Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M8 19.5h8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.45"
            />
          </svg>
        </span>
        <h2 className="emptyState__title">{t("emptyList")}</h2>
        <p className="emptyState__text">{t("emptyListHint")}</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {props.weatherList.map((item, index) => (
        <div className="grid__col" key={item.id}>
          <WeatherCardItem
            order={index}
            dataCard={item}
            removeWeatherCard={props.removeWeatherCard}
            getUnitsThunk={props.getUnitsThunk}
            getWeatherDataThunk={props.getWeatherDataThunk}
          />
        </div>
      ))}
    </div>
  );
};

export default WeatherList;
