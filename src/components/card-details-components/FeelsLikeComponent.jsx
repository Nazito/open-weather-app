import React from "react";
import { useState, useEffect } from 'react';

const FeelsLikeComponent = (props) => {
    let [temp, setTemp] = useState('')

    useEffect(() => {
        setTemp(Math.round(props.temp))
    },[]);

  return (
    <div className="feels-like">
      <span className="title">
          Feels like: 
      </span>
      { temp > 0 ? '+' : temp === 0 ? '' : ''} 
      { temp } °C 
    </div>
  );
};

export default FeelsLikeComponent;
