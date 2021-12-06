import React from "react";
import { useTranslation } from "react-i18next";

const FeelsLikeComponent = (props) => {
  const { t } = useTranslation();
  const temp = Math.round(props.temp);

  return (
    <div className="feels-like">
      <span className="title">{t("feelsLike")}</span>
      {temp > 0 ? "+" : temp === 0 ? "" : ""}
      {temp} °C
    </div>
  );
};

export default FeelsLikeComponent;
