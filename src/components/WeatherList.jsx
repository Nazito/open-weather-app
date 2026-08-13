import React from "react";
import { useTranslation } from "react-i18next";
import WeatherCardItem from "./WeatherCardItem";

const WeatherList = (props) => {
  const { t } = useTranslation();

  if (props.weatherList.length === 0) {
    return <div>{t("emptyList")}</div>;
  }

  return (
        <div className="grid">
            {props.weatherList.map((item, index) => (
                <div className="grid__col" 
                key={item.id}
                >
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
