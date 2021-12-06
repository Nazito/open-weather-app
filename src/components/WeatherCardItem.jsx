import React from "react";
import LocalityComponent from "./card-details-components/LocalityComponent";
import IconInfoComponent from "./card-details-components/IconInfoComponent";
import DateComponent from "./card-details-components/DateComponent";
import TempComponent from "./card-details-components/TempComponent";
import ChartComponent from "./card-details-components/ChartComponent";
import HoursesComponent from "./card-details-components/HoursesComponent";
import FeelsLikeComponent from "./card-details-components/FeelsLikeComponent";
import InfoComponent from "./card-details-components/InfoComponent";
import { useTranslation } from "react-i18next";

const WeatherCardItem = (props) => {
  const { t } = useTranslation();

  const monthlyTranslateArray = (array) =>
    array.map((month) => {
      return t(`months.${month}`);
    });
  const daysTranslateArray = (array) =>
    array.map((month) => {
      return t(`days.${month}`);
    });

  const hourseBuilder = (timestamp) => {
    let formatTime = (n) => {
      if (n < 10) return "0" + n;
      return n;
    };
    let hourse = formatTime(new Date(timestamp * 1000).getHours());
    let minute = formatTime(new Date(timestamp * 1000).getMinutes());

    return `${hourse}:${minute}`;
  };

  const dateBuilder = (timestamp) => {
    let formatTime = new Date(timestamp * 1000);
    var months = monthlyTranslateArray([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]);
    let days = daysTranslateArray([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
    let day = days[formatTime.getDay()];
    let month = months[formatTime.getMonth()];
    let date = formatTime.getDate();

    return `${day}, ${date} ${month}`;
  };

  const handleRemoveCard = () => {
    let paramsList = JSON.parse(localStorage.getItem("params"));
    let newList = paramsList.filter((item, index) => index !== props.order);
    localStorage.setItem("params", JSON.stringify(newList));
    props.removeWeatherCard(props.dataCard.id);
  };

  const handleChangeUnits = (units) => () => {
    let paramsList = JSON.parse(localStorage.getItem("params"));
    let newList = paramsList.map((item, index) => {
      if (index === props.order) {
        item.units = units;
        return item;
      } else {
        return item;
      }
    });
    localStorage.setItem("params", JSON.stringify(newList));
    let currentItem = paramsList.filter((item, index) => index === props.order);
    props.getUnitsThunk(
      currentItem[0].lat,
      currentItem[0].lng,
      units,
      currentItem[0].id
    );
  };

  return (
    <div className="weatherCardItem">
      <div className="weatherCardItem__Top">
        <LocalityComponent locality={props.dataCard.geoData.results} />
        <IconInfoComponent
          iconInfo={props.dataCard.weatherData.current.weather[0]}
        />

        <button className="removeBtn" onClick={handleRemoveCard}>
          <div className="removeBtn__inner"></div>
        </button>
      </div>

      <div className="weatherCardItem__CityDate">
        <DateComponent
          date={dateBuilder(props.dataCard.weatherData.current.dt)}
          hourse={hourseBuilder(props.dataCard.weatherData.current.dt)}
        />
      </div>

      <div className="weatherCardItem__Center">
        <ChartComponent
          hourses={props.dataCard.weatherData.hourly.map((hourse) =>
            hourseBuilder(hourse.dt)
          )}
          temp={props.dataCard.weatherData.hourly}
        />
        <HoursesComponent
          hourses={props.dataCard.weatherData.hourly.map((hourse) =>
            hourseBuilder(hourse.dt)
          )}
        />
      </div>
      <div className="weatherCardItem__Bottom">
        <div className="weatherCardItem__Bottom_Left">
          <div className="temp">
            <TempComponent temp={props.dataCard.weatherData.current.temp} />
            <div className="temp-switch">
              <button
                onClick={handleChangeUnits("metric")}
                className={props.dataCard.units === "metric" && "active"}
              >
                °C
              </button>
              <span className="separ">|</span>
              <button
                onClick={handleChangeUnits("imperial")}
                className={props.dataCard.units === "imperial" && "active"}
              >
                °F
              </button>
            </div>
          </div>
          <FeelsLikeComponent
            temp={props.dataCard.weatherData.current.feels_like}
          />
        </div>
        <div className="weatherCardItem__Bottom_Right">
          <InfoComponent info={props.dataCard.weatherData.current} />
        </div>
      </div>
    </div>
  );
};

export default WeatherCardItem;
