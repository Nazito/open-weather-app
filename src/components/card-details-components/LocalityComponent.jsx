import React from "react";
import { useState, useEffect } from 'react';

const LocalityComponent = (props) => {
    let [sity, setSity] = useState('')
    let [country, setCountry] = useState('')

    useEffect(() => {

        const getShortAddressObject = (object) => {
            let address = {};
            const address_components = object[0].address_components;
            address_components.forEach(element => {
                address[element.types[0]] = element.short_name;
            });
            return address;
        }
    
        const getLongAddressObject = (object) => {
            let address = {};
            const address_components = object[0].address_components;
            address_components.forEach(element => {
                address[element.types[0]] = element.long_name;
            });
            return address;
        }
    
        let shortName = getShortAddressObject(props.locality)
        let longName = getLongAddressObject(props.locality)

        setSity(longName.locality ? longName.locality : longName.administrative_area_level_1)
        setCountry(shortName.country)
    },[]);

  return (
    <div className="weatherCardItem__Top_City">
        {sity}, {country}
    </div>
  );
};

export default LocalityComponent;
