import axios from "axios";

const weatherClient = axios.create({
  baseURL: "https://api.open-meteo.com/v1/",
});

const geoClient = axios.create({
  baseURL: "https://geocoding-api.open-meteo.com/v1/",
});

const reverseClient = axios.create({
  baseURL: "https://api.bigdatacloud.net/data/",
});

const wmoToOwIcon = (code) => {
  if (code === 0) return "01d";
  if (code === 1) return "02d";
  if (code === 2) return "03d";
  if (code === 3) return "04d";
  if (code === 45 || code === 48) return "50d";
  if ([51, 53, 55, 56, 57].includes(code)) return "09d";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "10d";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "13d";
  if ([95, 96, 99].includes(code)) return "11d";
  return "03d";
};

const normalizeWeather = (data) => {
  const current = data.current;
  const nowMs = Date.now();

  const hourly = data.hourly.time
    .map((time, index) => ({
      dt: Math.floor(new Date(time).getTime() / 1000),
      temp: data.hourly.temperature_2m[index],
    }))
    .filter((item) => item.dt * 1000 >= nowMs - 30 * 60 * 1000)
    .slice(0, 48);

  return {
    current: {
      dt: Math.floor(new Date(current.time).getTime() / 1000),
      temp: current.temperature_2m,
      feels_like: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      pressure: current.pressure_msl,
      wind_speed: current.wind_speed_10m,
      weather: [
        {
          icon: wmoToOwIcon(current.weather_code),
          code: current.weather_code,
        },
      ],
    },
    hourly,
  };
};

export const weatherAPI = {
  getWeather(lat, lng, units) {
    return weatherClient
      .get("forecast", {
        params: {
          latitude: lat,
          longitude: lng,
          current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "wind_speed_10m",
            "pressure_msl",
          ].join(","),
          hourly: "temperature_2m",
          forecast_days: 2,
          wind_speed_unit: "ms",
          timezone: "auto",
          temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
        },
      })
      .then((response) => ({
        data: normalizeWeather(response.data),
      }));
  },
};

export const geolocationAPI = {
  searchCities(name, lang = "en") {
    if (!name || !name.trim()) {
      return Promise.resolve({ data: { results: [] } });
    }

    return geoClient.get("search", {
      params: {
        name: name.trim(),
        count: 6,
        language: lang,
        format: "json",
      },
    });
  },

  getLocationCity(lat, lng, lang = "en") {
    return reverseClient
      .get("reverse-geocode-client", {
        params: {
          latitude: lat,
          longitude: lng,
          localityLanguage: lang,
        },
      })
      .then((response) => {
        const data = response.data;
        return {
          data: {
            city:
              data.city ||
              data.locality ||
              data.principalSubdivision ||
              data.countryName,
            country: data.countryCode || data.countryName || "",
          },
        };
      });
  },
};
