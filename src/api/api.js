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

const normalizeNominatimResults = (items = []) =>
  items.map((item) => {
    const address = item.address || {};
    return {
      id: item.place_id,
      name:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        item.name ||
        (item.display_name || "").split(",")[0],
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      admin1: address.state || address.region || address.county || "",
      country: address.country || "",
    };
  });

const normalizePhotonResults = (features = []) =>
  features.map((feature, index) => {
    const props = feature.properties || {};
    const coords = (feature.geometry && feature.geometry.coordinates) || [];
    return {
      id: props.osm_id || `${props.name || "place"}-${index}`,
      name: props.name || props.city || props.street || "Unknown",
      latitude: Number(coords[1]),
      longitude: Number(coords[0]),
      admin1: props.state || props.county || "",
      country: props.country || "",
    };
  });

const searchCitiesPhoton = (query, lang) =>
  axios
    .get("https://photon.komoot.io/api/", {
      params: {
        q: query,
        lang: lang === "uk" ? "en" : lang,
        limit: 6,
      },
    })
    .then((response) => ({
      data: {
        results: normalizePhotonResults(
          (response.data && response.data.features) || []
        ).filter(
          (item) =>
            Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
        ),
      },
    }));

const searchCitiesNominatim = (query, lang) =>
  axios
    .get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: query,
        format: "json",
        addressdetails: 1,
        limit: 6,
        "accept-language": lang,
      },
    })
    .then((response) => ({
      data: {
        results: normalizeNominatimResults(response.data || []),
      },
    }));

const searchCitiesWithFallback = async (query, apiLang) => {
  try {
    const response = await geoClient.get("search", {
      params: {
        name: query,
        count: 6,
        language: apiLang,
        format: "json",
      },
    });
    const results = response.data && response.data.results;
    if (results && results.length > 0) {
      return { data: { results } };
    }
  } catch (error) {
    // continue to fallbacks
  }

  try {
    const photon = await searchCitiesPhoton(query, apiLang);
    if (photon.data.results.length > 0) {
      return photon;
    }
  } catch (error) {
    // continue
  }

  return searchCitiesNominatim(query, apiLang);
};
/** App langs (en/ru/ua) → API locale codes */
export const toApiLang = (lang) => {
  const normalized = (lang || "en").toLowerCase().split("-")[0];
  if (normalized === "ua" || normalized === "uk") return "uk";
  if (normalized === "ru") return "ru";
  return "en";
};

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

    const query = name.trim();
    const apiLang = toApiLang(lang);
    return searchCitiesWithFallback(query, apiLang);
  },

  getLocationCity(lat, lng, lang = "en") {
    return reverseClient
      .get("reverse-geocode-client", {
        params: {
          latitude: lat,
          longitude: lng,
          localityLanguage: toApiLang(lang),
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

  /** Approximate location by public IP when browser geolocation fails */
  getLocationByIp() {
    return axios
      .get("https://ipwho.is/")
      .then((response) => {
        const data = response.data;
        if (!data || data.success === false || data.latitude == null) {
          throw new Error("IP geolocation failed");
        }
        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          city: data.city || "",
          country: data.country_code || data.country || "",
        };
      })
      .catch(() =>
        axios.get("https://get.geojs.io/v1/ip/geo.json").then((response) => {
          const data = response.data;
          if (!data || data.latitude == null) {
            throw new Error("IP geolocation failed");
          }
          return {
            lat: Number(data.latitude),
            lng: Number(data.longitude),
            city: data.city || "",
            country: data.country_code || data.country || "",
          };
        })
      );
  },
};
