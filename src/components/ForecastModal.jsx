import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_KEYS = [
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
];

const ForecastDayRow = ({ day, t }) => {
  const date = new Date(day.dt * 1000);
  const weekday = t(`days.${DAY_KEYS[date.getDay()]}`);
  const month = t(`months.${MONTH_KEYS[date.getMonth()]}`);
  const code = day.weather?.[0]?.code;
  const icon = day.weather?.[0]?.icon || "03d";
  const description = t(`weatherCodes.${code}`, {
    defaultValue: t("weatherCodes.default"),
  });

  return (
    <li className="forecastModal__day">
      <div className="forecastModal__dayDate">
        <span className="forecastModal__weekday">{weekday}</span>
        <span className="forecastModal__fulldate">
          {date.getDate()} {month}
        </span>
      </div>
      <div className="forecastModal__dayWeather">
        <img
          src={`https://openweathermap.org/img/w/${icon}.png`}
          alt={description}
          width={36}
          height={36}
        />
        <span className="forecastModal__dayDescr">{description}</span>
      </div>
      <div className="forecastModal__temps">
        <span className="forecastModal__tempMax">
          {Math.round(day.tempMax)}°
        </span>
        <span className="forecastModal__tempMin">
          {Math.round(day.tempMin)}°
        </span>
      </div>
    </li>
  );
};

const ForecastModal = ({ card, onClose }) => {
  const { t } = useTranslation();
  const [range, setRange] = useState("week");

  const city =
    (card.geoData && (card.geoData.city || card.geoData.locality)) || "";
  const country = (card.geoData && card.geoData.country) || "";
  const current = card.weatherData.current;
  const daily = card.weatherData.daily || [];

  const visibleDays = useMemo(() => {
    if (range === "week") return daily.slice(0, 7);
    return daily.slice(0, 16);
  }, [daily, range]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="forecastModal" role="presentation" onClick={onClose}>
      <div
        className="forecastModal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("forecast.title")}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="forecastModal__close"
          onClick={onClose}
          aria-label={t("forecast.close")}
        >
          <span aria-hidden="true" />
        </button>

        <header className="forecastModal__header">
          <div>
            <h2 className="forecastModal__city">
              {city}
              {country ? `, ${country}` : ""}
            </h2>
            <p className="forecastModal__summary">
              <img
                src={`https://openweathermap.org/img/w/${
                  current.weather?.[0]?.icon || "03d"
                }.png`}
                alt=""
                width={40}
                height={40}
              />
              <span className="forecastModal__nowTemp">
                {Math.round(current.temp)}°
              </span>
              <span className="forecastModal__nowDescr">
                {t(`weatherCodes.${current.weather?.[0]?.code}`, {
                  defaultValue: t("weatherCodes.default"),
                })}
              </span>
            </p>
          </div>
        </header>

        <div
          className="forecastModal__tabs"
          role="tablist"
          aria-label={t("forecast.title")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={range === "week"}
            className={
              range === "week"
                ? "forecastModal__tab forecastModal__tab--active"
                : "forecastModal__tab"
            }
            onClick={() => setRange("week")}
          >
            {t("forecast.week")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={range === "outlook"}
            className={
              range === "outlook"
                ? "forecastModal__tab forecastModal__tab--active"
                : "forecastModal__tab"
            }
            onClick={() => setRange("outlook")}
          >
            {t("forecast.outlook")}
          </button>
        </div>

        {range === "outlook" && (
          <p className="forecastModal__hint">{t("forecast.outlookHint")}</p>
        )}

        {visibleDays.length === 0 ? (
          <p className="forecastModal__empty">{t("forecast.empty")}</p>
        ) : (
          <ul className="forecastModal__list">
            {visibleDays.map((day) => (
              <ForecastDayRow key={day.dt} day={day} t={t} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ForecastModal;
