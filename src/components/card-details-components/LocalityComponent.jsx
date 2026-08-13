import React from "react";

const LocalityComponent = ({ locality }) => {
  const city = (locality && locality.city) || "";
  const country = (locality && locality.country) || "";

  return (
    <div className="weatherCardItem__Top_City">
      {city}
      {country ? `, ${country}` : ""}
    </div>
  );
};

export default React.memo(LocalityComponent);
