import { useState, useEffect } from 'react';
import { connect } from "react-redux";
import './App.css';
import PlacesAutocomplete from 'react-places-autocomplete';
import {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
// import { setUserLocation } from './redux/geolocation-reducer';
import { getWeatherDataThunk, removeWeatherCard, getUnitsThunk } from './redux/weather-reducer';
import WeatherCardItem from './components/WeatherCardItem';
import WeatherList from './components/WeatherList';




const WeatherApp = (props) => { 
  console.log('render')

  let [address, setAddress] = useState('');
  let [coordinates, setCoordinates] = useState({lat: null, lng: null});

  useEffect(() => {
    // localStorage.setItem('userLocation', JSON.stringify(null))
    let userLocationData = JSON.parse(localStorage.getItem('userLocation'))
    let params = JSON.parse(localStorage.getItem('params')) || [];
    
    let userGeoParams;
    if(userLocationData === null && navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position =>{
          
          userGeoParams = { 
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            units: 'metric',
            id: Date.now()
          }

          params.push(userGeoParams)
          localStorage.setItem('params', JSON.stringify(params))
          localStorage.setItem('userLocation', JSON.stringify(true))

          params.reduce((promise, item) => {
            debugger
            return promise.then(() => props.getWeatherDataThunk(item))
          }, Promise.resolve());
        })
    
    }else{
      if (userGeoParams) {
        params.push(userGeoParams)
        localStorage.setItem('params', JSON.stringify(params))
      }

      params.reduce((promise, item) => {
        debugger
        return promise.then(() => props.getWeatherDataThunk(item))
      }, Promise.resolve());
    }
  },[]);

  const handleSelectAddress = async (value) =>{    
    let results = await geocodeByAddress(value)
    let latLng = await getLatLng(results[0])
    setAddress(value)
    setCoordinates(latLng)
  }
  const handleChangeAddress = (value) =>{
    setAddress(value)  
  }
  const handleAddWeather = async () =>{ 
    let queryParams = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      units: 'metric',
      id: Date.now()
    }
    
    let paramsList = JSON.parse(localStorage.getItem('params'))
    paramsList.push(queryParams)
    localStorage.setItem('params', JSON.stringify(paramsList))
    debugger
    await props.getWeatherDataThunk(queryParams)
    setAddress('')
  }
  return (
    <div className="weatherApp">
      <div className="container">
        <header className="header">
          <div className="searchBox">
            <PlacesAutocomplete 
              value={address} 
              onChange={handleChangeAddress} 
              onSelect={handleSelectAddress}
              >
                {({getInputProps, suggestions, getSuggestionItemProps, loading}) => {
                  return(
                  <div>
                    <input 
                      className="searchBox__Field"
                      {...getInputProps({placeholder: "City name..."})} 
                    />
                    <div className="searchBox__Autocomplite">
                      {/* <div>lat : {coordinates.lat}</div>
                      <div>lng : {coordinates.lng}</div> */}
                      
                      {loading ? <div>...loading</div> : null}
                      {suggestions.map(suggestion =>{
                        const style = suggestion.active
                        ? { backgroundColor: '#F2F2F2', cursor: 'pointer' }
                        : { backgroundColor: '#ffffff', cursor: 'pointer' };
                        console.log(suggestion)
                        return (
                          <div
                            className="searchBox__Autocomplite_Suggestion" 
                            key={suggestion.placeId} 
                            {...getSuggestionItemProps(suggestion,{style})}
                          >
                            {suggestion.description}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  )
                }}
            </PlacesAutocomplete>
            <button 
              className="searchBox__Btn"
              onClick={handleAddWeather}
            >
              Add
            </button>
          </div>
        </header>
        <main>
          <div className="mainWrap">
              <WeatherList 
                weatherList={props.weatherList}
                removeWeatherCard={props.removeWeatherCard}
                getUnitsThunk={props.getUnitsThunk}
                getWeatherDataThunk={props.getWeatherDataThunk}
              />
          </div>
        </main>
      </div>
    </div>
  );
}

let mapStateToProps = (state) => {
  debugger
  return {
    weatherList: state.weatherReducer.weatherList,
  };
};




export default connect(mapStateToProps, { removeWeatherCard, getUnitsThunk, getWeatherDataThunk})(WeatherApp);
