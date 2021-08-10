import React from "react";
import { useState, useEffect } from 'react';

const IconInfoComponent = (props) => {
    let [info, setInfo] = useState('')
    let [icon, setIcon] = useState('')

    useEffect(() => {
        setIcon(props.iconInfo.icon)
        setInfo(props.iconInfo.main)
    },[]);

  return (
        <div className="weatherCardItem__Top_Info">
            <img src={`http://openweathermap.org/img/w/${icon}.png`} alt={info}/>
            {info}
        </div>
  );
};

export default IconInfoComponent;
