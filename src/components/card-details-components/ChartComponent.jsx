import React from "react";
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const ChartComponent = (props) => {
    let [hourses, setHourses] = useState('')
    let [temp, setTemp] = useState('')
    let [tempMin, setTempMin] = useState('')
    let [tempMax, setTempMax] = useState('')
    let [palette, setPalette] = useState('')


    useEffect(() => {

        let tempForMax = props.temp.map( (temp, index) => Math.round(temp.temp))
        let maxVal = Math.max(...tempForMax) + 3
        setTempMax(maxVal)

        let tempForMin = props.temp.map( (temp, index) => Math.round(temp.temp))
        let minVal = Math.min(...tempForMin) - 3
        setTempMin(minVal)

        let temp = props.temp.map( (temp, index) => index % 5 === 0 && Math.round(temp.temp))
        let tempArr = temp.filter(item => item)
        setTemp(tempArr)

        let hourses = props.hourses.map( (hours, index) => index % 6 === 0 && hours )
        let hoursesArr = hourses.filter(item => item)
        setHourses(hoursesArr)

        let tempForMid = props.temp.map( (temp, index) => {
            return Math.round(temp.temp)
        })
        let midVal = Math.round(tempForMid.reduce((a, b) => a + b, 0) / tempForMid.length);
        
        if(midVal > 25){
            setPalette("rgba(141, 141, 141, .3)")
        }else if(midVal >= 10){
            setPalette("#C5C5C5")
        }else if(midVal > 0){
            setPalette("#F2F2F2")
        }else if(midVal <= 0 && midVal > -10){
            setPalette("#FFF1FE")
        }else if(midVal <= -10 && midVal > -20){
            setPalette("#F1F2FF")
        }else if(midVal <= 20){
            setPalette("rgba(69, 157, 233, .3)")
        }

        
    },[]);

  return (
    <Line 
        data={{
        labels: hourses,
        datasets: [{
            data: temp,
            borderWidth: 1,
            pointRadius: 3,
            lineTension: 0.5,
            
            fill: {
            target: 'origin', 
            above: palette,    
            below: palette  
            },

        }],
        }} 

        options= {{
        elements: {
            point: {
            borderColor: "transparent",
            backgroundColor: "transparent"
            }
        },                     


        plugins: {
            datalabels: {
            anchor: 'center',
            align: function (context) {
                var value = context.dataset.data[context.dataIndex];

                // let a = value.y 
                // debugger
                return value < 0 ? 'start' : 'end';
            },
            // offset: 2,
            padding: 4,
            // textMargin: 4,
            formatter: (val) => (`${val}`),
            labels: {
                value: {
                color: '#C5C5C5',
                }
            },
            font: {
                size: 6,
                family: 'Jost',
            }
            },
            legend: {
            display: false,
            }
        },
        scales: {
        //   xAxis: {
        //     ticks: {
        //         maxTicksLimit: 10
        //     }
        // },
            x: {
            display: false,
            // type: 'linear',

            ticks: {
                font: {
                size: 8,
                },
                // beginAtZero: true,
                // autoSkip: true,
                // maxTicksLimit: 8.1,
                maxRotation: 0,
                minRotation: 0,
                padding: 0,
                // labelOffset: -10,
                // stepSize: 1,
                // autoSkipPadding: 5,
                // labelOffset: 20,
                // align: 'center',
            },
            grid: {
                display:false,
                // offsetGridLines: true,
                drawTicks: false
            }
            },
            y: {
            min: tempMin,
            max: tempMax,
        
            
            display: false,
            ticks: {
                // beginAtZero: true,
                // maxTicksLimit: 5,
                // display: false,
            },
            grid: {
                display:false
            }
            }
        }
        }}

        plugins={[ChartDataLabels]}
        width={320}
        height={70}
    />
  );
};

export default ChartComponent;
