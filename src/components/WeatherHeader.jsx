import React, { useEffect, useRef, useState } from "react";
import i18n from "../assets/i18next";
import { useTranslation } from "react-i18next";
import { geolocationAPI } from "../api/api";
import { hasDuplicateLocation } from "../utils/location";

const formatSuggestion = (suggestion) => {
  const secondary = [suggestion.admin1, suggestion.country]
    .filter(Boolean)
    .join(", ");

  return {
    primary: suggestion.name,
    secondary,
    label: [suggestion.name, secondary].filter(Boolean).join(", "),
  };
};

const normalizeAppLang = (lang) =>
  (lang || "en").toLowerCase().split("-")[0];

const WeatherHeader = (props) => {
  const { t } = useTranslation();

  const [lang, setLang] = useState(
    () => localStorage.getItem("i18nextLng") || i18n.language || "en"
  );
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchError, setSearchError] = useState("");
  const debounceRef = useRef(null);
  const searchBoxRef = useRef(null);
  const searchRequestId = useRef(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
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
      setActiveIndex(-1);
      setSearchError("");
      return;
    }

    setLoading(true);
    setIsOpen(true);
    setSearchError("");
    const requestId = ++searchRequestId.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await geolocationAPI.searchCities(address, lang);
        if (requestId !== searchRequestId.current) return;

        const nextSuggestions = response.data.results || [];
        setSuggestions(nextSuggestions);
        setActiveIndex(-1);
        setIsOpen(true);
        setSearchError(
          nextSuggestions.length === 0 ? t("search.noResults") : ""
        );
      } catch (error) {
        if (requestId !== searchRequestId.current) return;
        console.error(error);
        setSuggestions([]);
        setSearchError(t("search.failed"));
        if (props.showToast) {
          props.showToast({
            type: "error",
            message: t("search.failed"),
          });
        }
      } finally {
        if (requestId === searchRequestId.current) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [address, coordinates.lat, lang, t, props.showToast]);

  const handleChangeAddress = (event) => {
    setCoordinates({ lat: null, lng: null });
    setAddress(event.target.value);
  };

  const handleClear = () => {
    setAddress("");
    setCoordinates({ lat: null, lng: null });
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setSearchError("");
  };

  const handleSelectSuggestion = (suggestion) => {
    const { label } = formatSuggestion(suggestion);

    setAddress(label);
    setCoordinates({
      lat: suggestion.latitude,
      lng: suggestion.longitude,
    });
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleAddWeather = async () => {
    if (coordinates.lat == null || coordinates.lng == null) {
      return;
    }

    const paramsList = JSON.parse(localStorage.getItem("params")) || [];

    if (hasDuplicateLocation(paramsList, coordinates.lat, coordinates.lng)) {
      if (props.showToast) {
        props.showToast({
          type: "info",
          message: t("search.duplicateCity"),
        });
      }
      handleClear();
      return;
    }

    const queryParams = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      units: "metric",
      lang,
      id: Date.now(),
    };

    paramsList.unshift(queryParams);
    localStorage.setItem("params", JSON.stringify(paramsList));
    await props.getWeatherDataThunk(queryParams);
    handleClear();
  };

  const handleKeyDown = (event) => {
    if (!isOpen || (!loading && suggestions.length === 0)) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAddWeather();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelectSuggestion(suggestions[activeIndex]);
      }
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleChangeLang = async (nextLang) => {
    i18n.changeLanguage(nextLang);
    setLang(nextLang);

    const params = JSON.parse(localStorage.getItem("params")) || [];
    params.forEach((item) => {
      item.lang = nextLang;
    });
    localStorage.setItem("params", JSON.stringify(params));

    setCoordinates({ lat: null, lng: null });

    if (address.trim()) {
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }

    props.getWeatherDataListThunk(params);
  };

  const showDropdown = isOpen && address.trim() && coordinates.lat === null;

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__brandMark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path
              d="M7.5 16.5h9.2a3.7 3.7 0 0 0 .3-7.4 5.2 5.2 0 0 0-10.1-1.2A3.8 3.8 0 0 0 7.5 16.5Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="header__brandText">
          <span className="header__brandName">{t("brand.name")}</span>
          <span className="header__brandTag">{t("brand.tag")}</span>
        </span>
      </div>

      <div className="searchBox" ref={searchBoxRef}>
        <div className="searchBox__wrap">
          <div
            className={`searchBox__control${
              showDropdown ? " searchBox__control--open" : ""
            }`}
          >
            <span className="searchBox__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M16.2 16.2L20 20"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              className="searchBox__Field"
              value={address}
              onChange={handleChangeAddress}
              onFocus={() => {
                if (address.trim() && coordinates.lat === null) {
                  setIsOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("search.placeholder")}
              autoComplete="off"
              aria-autocomplete="list"
            />
            {address && (
              <button
                type="button"
                className="searchBox__clear"
                onClick={handleClear}
                aria-label={t("search.clear")}
              >
                ×
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="searchBox__Autocomplite" role="listbox">
              {loading && (
                <div className="searchBox__status">{t("search.loading")}</div>
              )}

              {!loading && searchError && (
                <div className="searchBox__status">{searchError}</div>
              )}

              {!loading &&
                !searchError &&
                suggestions.map((suggestion, index) => {
                  const { primary, secondary } = formatSuggestion(suggestion);
                  const isActive = index === activeIndex;

                  return (
                    <button
                      type="button"
                      className={`searchBox__Autocomplite_Suggestion${
                        isActive
                          ? " searchBox__Autocomplite_Suggestion--active"
                          : ""
                      }`}
                      key={`${suggestion.id}-${suggestion.latitude}-${suggestion.longitude}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSelectSuggestion(suggestion);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      role="option"
                      aria-selected={isActive}
                    >
                      <span className="searchBox__suggestionPrimary">
                        {primary}
                      </span>
                      {secondary && (
                        <span className="searchBox__suggestionSecondary">
                          {secondary}
                        </span>
                      )}
                    </button>
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

      <div className="header__aside">
        <button
          type="button"
          className="geoBtn"
          onClick={props.onUseMyLocation}
          disabled={
            props.hasUserLocation || props.geoStatus === "loading"
          }
          title={
            props.hasUserLocation
              ? t("geo.alreadyAdded")
              : t("geo.useMyLocation")
          }
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="11"
              r="2.2"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
          <span>
            {props.geoStatus === "loading"
              ? t("geo.loadingShort")
              : t("geo.useMyLocation")}
          </span>
        </button>

        <div className="langMenu" role="group" aria-label={t("brand.lang")}>
          {["en", "ua", "ru"].map((code) => (
            <button
              key={code}
              type="button"
              className={`langItem${
                normalizeAppLang(lang) === code ? " langItem--active" : ""
              }`}
              onClick={() => handleChangeLang(code)}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default WeatherHeader;
