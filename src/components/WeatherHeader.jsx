import React, { useEffect, useRef, useState } from "react";
import i18n from "../assets/i18next";
import { useTranslation } from "react-i18next";
import { geolocationAPI } from "../api/api";

const WeatherHeader = (props) => {
  const { t } = useTranslation();

  const [lang, setLang] = useState(localStorage.getItem("i18nextLng"));
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!address.trim() || coordinates.lat !== null) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await geolocationAPI.searchCities(
          address,
          localStorage.getItem("i18nextLng") || "en"
        );
        setSuggestions(response.data.results || []);
        setIsOpen(true);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [address, coordinates.lat]);

  const handleChangeAddress = (event) => {
    setCoordinates({ lat: null, lng: null });
    setAddress(event.target.value);
  };

  const handleSelectSuggestion = (suggestion) => {
    const label = [suggestion.name, suggestion.admin1, suggestion.country]
      .filter(Boolean)
      .join(", ");

    setAddress(label);
    setCoordinates({
      lat: suggestion.latitude,
      lng: suggestion.longitude,
    });
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleAddWeather = async () => {
    if (coordinates.lat == null || coordinates.lng == null) {
      return;
    }

    const queryParams = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      units: "metric",
      lang: localStorage.getItem("i18nextLng"),
      id: Date.now(),
    };

    const paramsList = JSON.parse(localStorage.getItem("params")) || [];
    paramsList.push(queryParams);
    localStorage.setItem("params", JSON.stringify(paramsList));
    await props.getWeatherDataThunk(queryParams);
    setAddress("");
    setCoordinates({ lat: null, lng: null });
    setSuggestions([]);
  };

  const handleChangeLang = async (nextLang) => {
    i18n.changeLanguage(nextLang);
    setLang(nextLang);

    const params = JSON.parse(localStorage.getItem("params")) || [];
    params.forEach((item) => {
      item.lang = nextLang;
    });
    localStorage.setItem("params", JSON.stringify(params));

    props.getWeatherDataListThunk(params);
  };

  return (
    <header className="header">
      <div className="searchBox" ref={searchBoxRef}>
        <div className="searchBox__wrap">
          <input
            className="searchBox__Field"
            value={address}
            onChange={handleChangeAddress}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder={t("search.placeholder")}
            autoComplete="off"
          />
          {isOpen && (loading || suggestions.length > 0) && (
            <div className="searchBox__Autocomplite">
              {loading ? <div>...loading</div> : null}
              {suggestions.map((suggestion) => {
                const label = [
                  suggestion.name,
                  suggestion.admin1,
                  suggestion.country,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <div
                    className="searchBox__Autocomplite_Suggestion"
                    key={`${suggestion.id}-${suggestion.latitude}-${suggestion.longitude}`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    style={{ cursor: "pointer", backgroundColor: "#ffffff" }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <button
          className="searchBox__Btn"
          onClick={handleAddWeather}
          disabled={coordinates.lat == null}
        >
          {t("search.btn")}
        </button>
      </div>

      <div className="langMenu">
        <div className="langSelected">
          {lang}
          <span className="langSelected__trigger"></span>
        </div>
        <ul className="langList">
          <li className="langItem" onClick={() => handleChangeLang("en")}>
            EN
          </li>
          <li className="langItem" onClick={() => handleChangeLang("ua")}>
            UA
          </li>
          <li className="langItem" onClick={() => handleChangeLang("ru")}>
            RU
          </li>
        </ul>
      </div>
    </header>
  );
};

export default WeatherHeader;
