import React from "react";
import { useState, useEffect } from 'react';

const InfoComponent = (props) => {
    let [wind, setWind] = useState('')
    let [humidity, setHumidity] = useState('')
    let [pressure, setPressure] = useState('')

    useEffect(() => {
        setWind(Math.round(props.info.wind_speed))
        setHumidity(Math.round(props.info.humidity))
        setPressure(Math.round(props.info.pressure))
    },[]);

  return (
    <>
      <div className="wind">
          <span className="title">
              Wind: 
          </span>
          <span className="val">
            {wind} m/s
          </span>
      </div>
      <div className="humidity">
          <span className="title">
              Humidity: 
          </span>
          <span className="val">
            {humidity}%
          </span>
      </div>
      <div className="pressure">
          <span className="title">
              Pressure: 
          </span>
          <span className="val">
            {pressure}Pa
          </span>
      </div>
    </>
  );
};

export default InfoComponent;
