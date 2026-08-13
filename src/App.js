import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import "./App.css";
import {
  getWeatherDataThunk,
  removeWeatherCard,
  getUnitsThunk,
  getWeatherDataListThunk,
  reorderWeatherCards,
} from "./redux/weather-reducer";
import WeatherList from "./components/WeatherList";
import WeatherHeader from "./components/WeatherHeader";
import ToastStack from "./components/ToastStack";
import { createDefaultCityParams } from "./constants/defaultCities";
import { geolocationAPI } from "./api/api";
import i18n from "./assets/i18next";
import { isSameLocation } from "./utils/location";

const readParams = () => {
  try {
    return JSON.parse(localStorage.getItem("params")) || [];
  } catch (error) {
    return [];
  }
};

const readUserLocationFlag = () => {
  try {
    return JSON.parse(localStorage.getItem("userLocation"));
  } catch (error) {
    return null;
  }
};

const hasUserLocationCard = (params) =>
  params.some((item) => item && item.isUserLocation);

const getPermissionState = async () => {
  try {
    if (!navigator.permissions || !navigator.permissions.query) {
      return "unknown";
    }
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state;
  } catch (error) {
    return "unknown";
  }
};

const requestOnce = (options) =>
  new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({
        status: "error",
        message: "Geolocation timeout (browser did not respond)",
        error: { code: 3 },
      });
    }, (options && options.timeout) || 10000);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timer);
          finish({
            status: "success",
            source: "browser",
            params: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              units: "metric",
              lang: localStorage.getItem("i18nextLng") || "en",
              id: Date.now(),
              isUserLocation: true,
            },
          });
        },
        (error) => {
          clearTimeout(timer);
          finish({
            status: error && error.code === 1 ? "denied" : "error",
            message: (error && error.message) || "Geolocation failed",
            error,
          });
        },
        options
      );
    } catch (error) {
      clearTimeout(timer);
      finish({
        status: "error",
        message: (error && error.message) || "Geolocation threw",
      });
    }
  });

const requestBrowserGeoParams = async () => {
  if (!navigator.geolocation) {
    return { status: "unsupported", message: "Geolocation API missing" };
  }

  const first = await requestOnce({
    enableHighAccuracy: false,
    timeout: 8000,
    maximumAge: 60 * 1000,
  });
  if (first.status === "success" || first.status === "denied") {
    return first;
  }

  return requestOnce({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  });
};

const requestIpGeoParams = async () => {
  const ipLocation = await geolocationAPI.getLocationByIp();
  return {
    status: "success",
    source: "ip",
    params: {
      lat: ipLocation.lat,
      lng: ipLocation.lng,
      units: "metric",
      lang: localStorage.getItem("i18nextLng") || "en",
      id: Date.now(),
      isUserLocation: true,
      isApproximate: true,
    },
  };
};

const requestUserGeoParams = async () => {
  const browserResult = await requestBrowserGeoParams();
  if (browserResult.status === "success") {
    return browserResult;
  }

  try {
    const ipResult = await requestIpGeoParams();
    return {
      ...ipResult,
      browserError: browserResult,
    };
  } catch (error) {
    return {
      ...browserResult,
      message:
        (browserResult && browserResult.message) ||
        (error && error.message) ||
        "Location failed",
    };
  }
};

const WeatherApp = (props) => {
  const [geoStatus, setGeoStatus] = useState("idle");
  const [toasts, setToasts] = useState([]);

  const hasUserLocation =
    props.weatherList.some((item) => item.isUserLocation) ||
    hasUserLocationCard(readParams());

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [
      ...prev,
      {
        id,
        type: toast.type || "info",
        message: toast.message,
        debug: toast.debug || "",
      },
    ]);
  }, []);

  const saveAndLoad = (params) => {
    localStorage.setItem("params", JSON.stringify(params));
    props.getWeatherDataListThunk(params);
  };

  const ensureDefaultCities = (params, lang) => {
    if (params.length > 0) return params;
    const defaults = createDefaultCityParams(lang);
    localStorage.setItem("params", JSON.stringify(defaults));
    return defaults;
  };

  const addUserLocationCard = async () => {
    if (hasUserLocation || geoStatus === "loading") {
      return false;
    }

    setGeoStatus("loading");

    const permissionState = await getPermissionState();
    const geoResult = await requestUserGeoParams();

    if (geoResult.status === "success") {
      const currentParams = readParams().filter((item) => !item.isUserLocation);
      const duplicateIndex = currentParams.findIndex((item) =>
        isSameLocation(item, geoResult.params)
      );

      if (duplicateIndex >= 0) {
        const nextParams = currentParams.map((item, index) =>
          index === duplicateIndex
            ? { ...item, isUserLocation: true }
            : item
        );
        localStorage.setItem("userLocation", JSON.stringify(true));
        saveAndLoad(nextParams);
        setGeoStatus("ready");
        showToast({
          type: "info",
          message: i18n.t("search.duplicateCity"),
        });
        return true;
      }

      const nextParams = [geoResult.params, ...currentParams];
      localStorage.setItem("userLocation", JSON.stringify(true));
      saveAndLoad(nextParams);
      setGeoStatus("ready");

      if (geoResult.source === "ip") {
        const browserCode =
          geoResult.browserError &&
          geoResult.browserError.error &&
          geoResult.browserError.error.code;
        showToast({
          type: "info",
          message: i18n.t("geo.approximateText"),
          debug: `source=ip; browserPermission=${permissionState}; browserErrorCode=${
            browserCode != null ? browserCode : "-"
          }`,
        });
      }
      return true;
    }

    const code =
      geoResult.error && typeof geoResult.error.code === "number"
        ? geoResult.error.code
        : "-";
    setGeoStatus(geoResult.status === "denied" ? "denied" : "error");
    showToast({
      type: "error",
      message: i18n.t(
        geoResult.status === "denied" ? "geo.deniedText" : "geo.unavailableText"
      ),
      debug: `permission=${permissionState}; errorCode=${code}; host=${window.location.hostname}; secure=${window.isSecureContext}`,
    });
    if (geoResult.status === "denied") {
      localStorage.setItem("userLocation", JSON.stringify(false));
    }
    return false;
  };

  useEffect(() => {
    const lang = localStorage.getItem("i18nextLng") || "en";
    let params = ensureDefaultCities(readParams(), lang);
    const userLocationFlag = readUserLocationFlag();

    if (
      userLocationFlag === true &&
      params.length > 0 &&
      !hasUserLocationCard(params)
    ) {
      params = [{ ...params[0], isUserLocation: true }, ...params.slice(1)];
      localStorage.setItem("params", JSON.stringify(params));
    }

    props.getWeatherDataListThunk(params);
    setGeoStatus(hasUserLocationCard(params) ? "ready" : "idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="weatherApp">
      <div className="container">
        <WeatherHeader
          getWeatherDataThunk={props.getWeatherDataThunk}
          getWeatherDataListThunk={props.getWeatherDataListThunk}
          geoStatus={geoStatus}
          onUseMyLocation={addUserLocationCard}
          hasUserLocation={hasUserLocation}
          showToast={showToast}
        />
        <main>
          <div className="mainWrap">
            <WeatherList
              weatherList={props.weatherList}
              removeWeatherCard={props.removeWeatherCard}
              getUnitsThunk={props.getUnitsThunk}
              reorderWeatherCards={props.reorderWeatherCards}
            />
          </div>
        </main>
      </div>

      <ToastStack toasts={toasts} onClose={dismissToast} />
    </div>
  );
};

let mapStateToProps = (state) => {
  return {
    weatherList: state.weatherReducer.weatherList,
  };
};

export default connect(mapStateToProps, {
  getWeatherDataListThunk,
  removeWeatherCard,
  getUnitsThunk,
  getWeatherDataThunk,
  reorderWeatherCards,
})(WeatherApp);
