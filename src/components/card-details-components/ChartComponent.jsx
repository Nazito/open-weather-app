import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

const formatHour = (timestamp) => {
  const formatTime = (n) => (n < 10 ? `0${n}` : `${n}`);
  const date = new Date(timestamp * 1000);
  return `${formatTime(date.getHours())}:${formatTime(date.getMinutes())}`;
};

const buildPalette = (midVal) => {
  if (midVal > 25) return "rgba(141, 141, 141, .3)";
  if (midVal >= 10) return "#C5C5C5";
  if (midVal > 0) return "#F2F2F2";
  if (midVal <= 0 && midVal > -10) return "#FFF1FE";
  if (midVal <= -10 && midVal > -20) return "#F1F2FF";
  return "rgba(69, 157, 233, .3)";
};

const ChartComponent = ({ hourly = [] }) => {
  const chartModel = useMemo(() => {
    if (!hourly.length) {
      return {
        labels: [],
        data: [],
        tempMin: 0,
        tempMax: 1,
        palette: "#F2F2F2",
      };
    }

    const rounded = hourly.map((item) => Math.round(item.temp));
    const sampledTemps = rounded.filter((_, index) => index % 5 === 0);
    const sampledHours = hourly
      .map((item, index) => (index % 6 === 0 ? formatHour(item.dt) : null))
      .filter(Boolean);

    const midVal = Math.round(
      rounded.reduce((sum, value) => sum + value, 0) / rounded.length
    );

    return {
      labels: sampledHours,
      data: sampledTemps,
      tempMin: Math.min(...rounded) - 3,
      tempMax: Math.max(...rounded) + 3,
      palette: buildPalette(midVal),
    };
  }, [hourly]);

  const chartData = useMemo(
    () => ({
      labels: chartModel.labels,
      datasets: [
        {
          data: chartModel.data,
          borderWidth: 1,
          pointRadius: 3,
          lineTension: 0.5,
          fill: {
            target: "origin",
            above: chartModel.palette,
            below: chartModel.palette,
          },
        },
      ],
    }),
    [chartModel]
  );

  const chartOptions = useMemo(
    () => ({
      animation: false,
      animations: false,
      responsive: false,
      elements: {
        point: {
          borderColor: "transparent",
          backgroundColor: "transparent",
        },
      },
      plugins: {
        datalabels: {
          anchor: "center",
          align: (context) => {
            const value = context.dataset.data[context.dataIndex];
            return value < 0 ? "start" : "end";
          },
          padding: 4,
          formatter: (val) => `${val}`,
          labels: {
            value: {
              color: "#C5C5C5",
            },
          },
          font: {
            size: 6,
            family: "Jost",
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          display: false,
          ticks: {
            font: { size: 8 },
            maxRotation: 0,
            minRotation: 0,
            padding: 0,
          },
          grid: {
            display: false,
            drawTicks: false,
          },
        },
        y: {
          min: chartModel.tempMin,
          max: chartModel.tempMax,
          display: false,
          grid: {
            display: false,
          },
        },
      },
    }),
    [chartModel.tempMin, chartModel.tempMax]
  );

  return (
    <Line
      data={chartData}
      options={chartOptions}
      plugins={[ChartDataLabels]}
      width={320}
      height={70}
    />
  );
};

export default React.memo(ChartComponent);
