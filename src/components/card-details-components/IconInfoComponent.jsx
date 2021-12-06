import React from "react";

const IconInfoComponent = (props) => {
  return (
        <div className="weatherCardItem__Top_Info">
            <img src={`http://openweathermap.org/img/w/${props.iconInfo.icon}.png`} alt={props.iconInfo.description}/>
            <span className="descr">{props.iconInfo.description}</span>
        </div>
  );
};

export default IconInfoComponent;
