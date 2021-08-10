import React from "react";
import { useState, useEffect } from 'react';

const HoursesComponent = (props) => {

  return (
    <div className="hourses">
      {props.hourses && props.hourses.map( (hours, index) => {
        if(index % 6 === 0){
          return <div key={index} className="hours">{hours}</div>
        }
      })}
    </div>
  );
};

export default HoursesComponent;
