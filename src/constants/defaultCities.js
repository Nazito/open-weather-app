/** Popular cities shown on first load / empty state */
export const DEFAULT_CITIES = [
  {
    name: "London",
    lat: 51.5074,
    lng: -0.1278,
  },
  {
    name: "New York",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    name: "Tokyo",
    lat: 35.6762,
    lng: 139.6503,
  },
  {
    name: "Paris",
    lat: 48.8566,
    lng: 2.3522,
  },
];

export const createDefaultCityParams = (lang = "en") =>
  DEFAULT_CITIES.map((city, index) => ({
    lat: city.lat,
    lng: city.lng,
    units: "metric",
    lang,
    id: Date.now() + index,
    isDefaultCity: true,
    cityName: city.name,
  }));
