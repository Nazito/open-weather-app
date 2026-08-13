import React from "react";
import { useTranslation } from "react-i18next";

const IconInfoComponent = (props) => {
  const { t } = useTranslation();
  const code = props.iconInfo?.code;
  const description = t(`weatherCodes.${code}`, {
    defaultValue: t("weatherCodes.default"),
  });

  return (
    <div className="weatherCardItem__Top_Info">
      <img
        src={`https://openweathermap.org/img/w/${props.iconInfo.icon}.png`}
        alt={description}
      />
      <span className="descr">{description}</span>
    </div>
  );
};

export default React.memo(IconInfoComponent);
