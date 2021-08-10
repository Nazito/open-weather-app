import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import WeatherCardItem from "./WeatherCardItem";



const WeatherList = (props) => {

    // let [data, setData] = useState([])

    // useEffect(() => {
    //     setData(props.weatherList)
    // },[]);

    

    if(props.weatherList.length === 0){
        return (
            <div>Загрузите файлы</div>
        )
    }

  return (
        <div className="grid">
            {props.weatherList.map((item, index) => (
                <div className="grid__col" 
                key={item.id}
                >
                <WeatherCardItem 
                    order={index}
                    dataCard={item} 
                    removeWeatherCard={props.removeWeatherCard}
                    getUnitsThunk={props.getUnitsThunk}
                    getWeatherDataThunk={props.getWeatherDataThunk}
                />
                </div>
            ))}
        </div>
    );
};

export default WeatherList;
