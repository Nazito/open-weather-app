import React from "react";
import { useState, useEffect } from 'react';

const TempComponent = (props) => {
    // let [temp, setTemp] = useState('')
  const temp = Math.round(props.temp)
    // useEffect(() => {
    //     setTemp()
    // },[]);

  return (
    <div className="temp-val">
      { temp > 0 ? '+' : temp === 0 ? '' : ''} 
      { temp }
    </div>
  );
};

export default TempComponent;
