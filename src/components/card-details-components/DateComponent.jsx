import React from "react";
import { useState, useEffect } from 'react';

const DateComponent = (props) => {
    let [hourse, setHourse] = useState('')
    let [date, setDate] = useState('')

    useEffect(() => {
        setDate(props.date)
        setHourse(props.hourse)
    },[]);

  return (
    <span>
        {date}, {hourse}
    </span>
  );
};

export default DateComponent;
