import React from "react";

const LocalityComponent = (props) => {
  const city = props.locality?.city || "";
  const country = props.locality?.country || "";

  return (
    <div className="weatherCardItem__Top_City">
      {city}
      {country ? `, ${country}` : ""}
    </div>
  );
};

export default LocalityComponent;
