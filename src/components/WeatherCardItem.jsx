import React, { useMemo } from "react";
import LocalityComponent from "./card-details-components/LocalityComponent";
import IconInfoComponent from "./card-details-components/IconInfoComponent";
import DateComponent from "./card-details-components/DateComponent";
import TempComponent from "./card-details-components/TempComponent";
import ChartComponent from "./card-details-components/ChartComponent";
import HoursesComponent from "./card-details-components/HoursesComponent";
import FeelsLikeComponent from "./card-details-components/FeelsLikeComponent";
import InfoComponent from "./card-details-components/InfoComponent";
import { useTranslation } from "react-i18next";

const formatHour = (timestamp) => {
  const formatTime = (n) => (n < 10 ? `0${n}` : `${n}`);
  const date = new Date(timestamp * 1000);
  return `${formatTime(date.getHours())}:${formatTime(date.getMinutes())}`;
};

const WeatherCardItem = (props) => {
  const { t } = useTranslation();
  const { dataCard, order } = props;

  const monthlyTranslateArray = (array) =>
    array.map((month) => t(`months.${month}`));
  const daysTranslateArray = (array) =>
    array.map((day) => t(`days.${day}`));

  const dateBuilder = (timestamp) => {
    const formatTime = new Date(timestamp * 1000);
    const months = monthlyTranslateArray([
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
    const days = daysTranslateArray([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
    const day = days[formatTime.getDay()];
    const month = months[formatTime.getMonth()];
    const date = formatTime.getDate();

    return `${day}, ${date} ${month}`;
  };

  const hourLabels = useMemo(
    () => dataCard.weatherData.hourly.map((item) => formatHour(item.dt)),
    [dataCard.weatherData.hourly]
  );

  const handleRemoveCard = () => {
    const paramsList = JSON.parse(localStorage.getItem("params")) || [];
    const removed = paramsList[order];
    const newList = paramsList.filter((_, index) => index !== order);
    localStorage.setItem("params", JSON.stringify(newList));

    if (removed && removed.isUserLocation) {
      localStorage.setItem("userLocation", JSON.stringify(null));
    }

    props.removeWeatherCard(dataCard.id);
  };

  const handleChangeUnits = (units) => () => {
    if (dataCard.units === units) return;

    const paramsList = JSON.parse(localStorage.getItem("params")) || [];
    const newList = paramsList.map((item, index) => {
      if (index === order) {
        return { ...item, units };
      }
      return item;
    });
    localStorage.setItem("params", JSON.stringify(newList));

    const currentItem = newList[order];
    if (!currentItem) return;

    props.getUnitsThunk(
      currentItem.lat,
      currentItem.lng,
      units,
      currentItem.id,
      currentItem.lang
    );
  };

  return (
    <div className="weatherCardItem">
      <button
        type="button"
        className="removeBtn"
        onClick={handleRemoveCard}
        aria-label={t("removeCard")}
      >
        <span className="removeBtn__inner" aria-hidden="true" />
      </button>

      <div className="weatherCardItem__Top">
        <div
          className="weatherCardItem__dragHandle"
          aria-label={t("dragCard")}
          title={t("dragCard")}
          {...(props.dragHandleProps || {})}
        >
          <svg viewBox="0 0 12 18" width="14" height="20" aria-hidden="true">
            <circle cx="3" cy="3.5" r="1.6" fill="currentColor" />
            <circle cx="9" cy="3.5" r="1.6" fill="currentColor" />
            <circle cx="3" cy="9" r="1.6" fill="currentColor" />
            <circle cx="9" cy="9" r="1.6" fill="currentColor" />
            <circle cx="3" cy="14.5" r="1.6" fill="currentColor" />
            <circle cx="9" cy="14.5" r="1.6" fill="currentColor" />
          </svg>
        </div>

        <div className="weatherCardItem__TopMain">
          <div className="weatherCardItem__TopMeta">
            <LocalityComponent locality={dataCard.geoData} />
            <div className="weatherCardItem__CityDate">
              <DateComponent
                date={dateBuilder(dataCard.weatherData.current.dt)}
                hourse={formatHour(dataCard.weatherData.current.dt)}
              />
            </div>
          </div>
          <IconInfoComponent
            iconInfo={dataCard.weatherData.current.weather[0]}
          />
        </div>
      </div>

      <div className="weatherCardItem__Center">
        <ChartComponent hourly={dataCard.weatherData.hourly} />
        <HoursesComponent hourses={hourLabels} />
      </div>

      <div className="weatherCardItem__Bottom">
        <div className="weatherCardItem__Bottom_Left">
          <div className="temp">
            <TempComponent temp={dataCard.weatherData.current.temp} />
            <div className="temp-switch">
              <button
                type="button"
                onClick={handleChangeUnits("metric")}
                className={dataCard.units === "metric" ? "active" : undefined}
              >
                °C
              </button>
              <span className="separ">|</span>
              <button
                type="button"
                onClick={handleChangeUnits("imperial")}
                className={
                  dataCard.units === "imperial" ? "active" : undefined
                }
              >
                °F
              </button>
            </div>
          </div>
          <FeelsLikeComponent
            temp={dataCard.weatherData.current.feels_like}
            units={dataCard.units}
          />
        </div>
        <div className="weatherCardItem__Bottom_Right">
          <InfoComponent info={dataCard.weatherData.current} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(WeatherCardItem, (prev, next) => {
  return (
    prev.order === next.order &&
    prev.dataCard === next.dataCard &&
    prev.removeWeatherCard === next.removeWeatherCard &&
    prev.getUnitsThunk === next.getUnitsThunk &&
    prev.dragHandleProps === next.dragHandleProps
  );
});
