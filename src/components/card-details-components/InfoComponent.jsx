import React from "react";
import { useTranslation } from "react-i18next";

const InfoComponent = (props) => {
  const { t } = useTranslation();
  const wind = Math.round(props.info.wind_speed);
  const humidity = Math.round(props.info.humidity);
  const pressure = Math.round(props.info.pressure);

  return (
    <>
      <div className="wind">
        <span className="title">{t("wind")}</span>
        <span className="val">
          {wind} {t("m/s")}
        </span>
      </div>
      <div className="humidity">
        <span className="title">{t("humidity")}</span>
        <span className="val">{humidity}%</span>
      </div>
      <div className="pressure">
        <span className="title">{t("pressure")}</span>
        <span className="val">{pressure}Pa</span>
      </div>
    </>
  );
};

export default InfoComponent;
