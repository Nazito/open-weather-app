import React from "react";
import { useTranslation } from "react-i18next";

const FeelsLikeComponent = (props) => {
  const { t } = useTranslation();
  const temp = Math.round(props.temp);
  const unit = props.units === "imperial" ? "°F" : "°C";

  return (
    <div className="feels-like">
      <span className="title">{t("feelsLike")}</span>
      {temp > 0 ? "+" : ""}
      {temp} {unit}
    </div>
  );
};

export default FeelsLikeComponent;
