import React from "react";
import { useState } from "react";

import PlacesAutocomplete from "react-places-autocomplete";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import i18n from "../assets/i18next";
import { useTranslation } from "react-i18next";

const WeatherHeader = (props) => {
  const { t } = useTranslation();

  let [lang, setLang] = useState(localStorage.getItem("i18nextLng"));
  let [address, setAddress] = useState("");
  let [coordinates, setCoordinates] = useState({ lat: null, lng: null });

  const handleSelectAddress = async (value) => {
    let results = await geocodeByAddress(value);
    let latLng = await getLatLng(results[0]);
    setAddress(value);
    setCoordinates(latLng);
  };
  const handleChangeAddress = (value) => {
    setAddress(value);
  };
  const handleAddWeather = async () => {
    let queryParams = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      units: "metric",
      lang: localStorage.getItem("i18nextLng"),
      id: Date.now(),
    };

    let paramsList = JSON.parse(localStorage.getItem("params"));
    paramsList.push(queryParams);
    localStorage.setItem("params", JSON.stringify(paramsList));
    await props.getWeatherDataThunk(queryParams);
    setAddress("");
  };

  const handleChangeLang = async (lang) => {
    i18n.changeLanguage(lang);
    setLang(lang);

    let params = JSON.parse(localStorage.getItem("params"));
    params.forEach((item) => {
      item.lang = lang;
    });
    localStorage.setItem("params", JSON.stringify(params));

    props.getWeatherDataListThunk(params);
  };

  return (
    <header className="header">
      <div className="searchBox">
        <PlacesAutocomplete
          value={address}
          onChange={handleChangeAddress}
          onSelect={handleSelectAddress}
        >
          {({
            getInputProps,
            suggestions,
            getSuggestionItemProps,
            loading,
          }) => {
            return (
              <div className="searchBox__wrap">
                <input
                  className="searchBox__Field"
                  {...getInputProps({ placeholder: "City name..." })}
                />
                <div className="searchBox__Autocomplite">
                  {/* <div>lat : {coordinates.lat}</div>
                                <div>lng : {coordinates.lng}</div> */}

                  {loading ? <div>...loading</div> : null}
                  {suggestions.map((suggestion) => {
                    const style = suggestion.active
                      ? { backgroundColor: "#F2F2F2", cursor: "pointer" }
                      : { backgroundColor: "#ffffff", cursor: "pointer" };
                    console.log(suggestion);
                    return (
                      <div
                        className="searchBox__Autocomplite_Suggestion"
                        key={suggestion.placeId}
                        {...getSuggestionItemProps(suggestion, { style })}
                      >
                        {suggestion.description}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }}
        </PlacesAutocomplete>
        <button className="searchBox__Btn" onClick={handleAddWeather}>
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
