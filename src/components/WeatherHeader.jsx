import React, { useEffect, useRef, useState } from "react";
import i18n from "../assets/i18next";
import { useTranslation } from "react-i18next";
import { geolocationAPI } from "../api/api";

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

const CYRILLIC_RE = /[\u0400-\u04FF]/;

const normalizeAppLang = (lang) =>
  (lang || "en").toLowerCase().split("-")[0];

const hasCyrillic = (value) => CYRILLIC_RE.test(value);

/** Keep only characters allowed for the selected UI language */
const sanitizeInputByLang = (value, lang) => {
  if (normalizeAppLang(lang) === "en") {
    return value.replace(/[\u0400-\u04FF]/g, "");
  }
  return value;
};

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
  const [inputError, setInputError] = useState("");
  const debounceRef = useRef(null);
  const searchBoxRef = useRef(null);
  const errorTimerRef = useRef(null);

  const showInputError = (message) => {
    setInputError(message);
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    errorTimerRef.current = setTimeout(() => {
      setInputError("");
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

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
      return;
    }

    setLoading(true);
    setIsOpen(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await geolocationAPI.searchCities(address, lang);
        setSuggestions(response.data.results || []);
        setActiveIndex(-1);
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
  }, [address, coordinates.lat, lang]);

  const handleChangeAddress = (event) => {
    const rawValue = event.target.value;

    if (normalizeAppLang(lang) === "en" && hasCyrillic(rawValue)) {
      const nextValue = sanitizeInputByLang(rawValue, lang);
      setCoordinates({ lat: null, lng: null });
      setAddress(nextValue);
      showInputError(t("search.scriptError"));
      return;
    }

    setInputError("");
    setCoordinates({ lat: null, lng: null });
    setAddress(rawValue);
  };

  const handleClear = () => {
    setAddress("");
    setCoordinates({ lat: null, lng: null });
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setInputError("");
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
    setInputError("");
  };

  const handleAddWeather = async () => {
    if (coordinates.lat == null || coordinates.lng == null) {
      return;
    }

    const queryParams = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      units: "metric",
      lang,
      id: Date.now(),
    };

    const paramsList = JSON.parse(localStorage.getItem("params")) || [];
    paramsList.push(queryParams);
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

    if (normalizeAppLang(nextLang) === "en" && hasCyrillic(address)) {
      setAddress(sanitizeInputByLang(address, nextLang));
      setCoordinates({ lat: null, lng: null });
      setSuggestions([]);
      setIsOpen(false);
      showInputError(i18n.getFixedT(nextLang)("search.scriptError"));
      props.getWeatherDataListThunk(params);
      return;
    }

    setInputError("");
    setCoordinates({ lat: null, lng: null });

    if (address.trim()) {
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }

    props.getWeatherDataListThunk(params);
  };

  const showDropdown =
    isOpen && address.trim() && coordinates.lat === null;

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
            }${inputError ? " searchBox__control--error" : ""}`}
          >
            <span className="searchBox__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
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
              aria-expanded={showDropdown}
              aria-invalid={Boolean(inputError)}
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

          {inputError && (
            <div className="searchBox__error" role="alert">
              {inputError}
            </div>
          )}

          {showDropdown && (
            <div className="searchBox__Autocomplite" role="listbox">
              {loading && (
                <div className="searchBox__status">{t("search.loading")}</div>
              )}

              {!loading && suggestions.length === 0 && (
                <div className="searchBox__status">{t("search.noResults")}</div>
              )}

              {!loading &&
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
                      onClick={() => handleSelectSuggestion(suggestion)}
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
    </header>
  );
};

export default WeatherHeader;
