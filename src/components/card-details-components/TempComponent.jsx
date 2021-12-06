import React from "react";

const TempComponent = (props) => {
  const temp = Math.round(props.temp);

  return (
    <div className="temp-val">
      {temp > 0 ? "+" : temp === 0 ? "" : ""}
      {temp}
    </div>
  );
};

export default TempComponent;
