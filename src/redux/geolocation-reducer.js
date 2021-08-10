import { geolocationAPI } from "../api/api";

const SET_LOCALITY = "SET_LOCALITY";
const SET_USER_LOCATION = "SET_USER_LOCATION";


let initialState = {
  locality: null,
  profile: null,
};

const geolocationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCALITY:
      // debugger
      return {
        ...state,
        locality: {
            city: action.payload.city,
            country: action.payload.country,
          }
      };

    case SET_USER_LOCATION:
      localStorage.setItem('userLocation', JSON.stringify({loc: true}))
      let userLocation = JSON.parse(localStorage.getItem('userLocation'))
      return {
        ...state,
        userLocation: userLocation.loc,
      };

    default:
      return state;
  }
};

export const setLocality = (payload) => ({
  type: SET_LOCALITY,
  payload,
});

export const setUserLocation = () => ({
  type: SET_USER_LOCATION,
});

// export const getUserProfile = (userId) => {
//   return async (dispach) => {
//     try{
//       let response = await profileAPI.getProfile(userId);
//       dispach(setUserProfile(response.data));

//     }catch(e){
//       debugger
//       alert(e.response.data.message)
//     }
//   };
// };

// export const uploadAvatarThunk = (file) => {
//   return async (dispach) => {
//     try{
     
//       const formData = new FormData()
//       formData.append('file', file)
      
//       let response = await profileAPI.uploadAvatar(formData);
//       dispach(setUserProfile(response.data));

//     }catch(e){
      
//       alert(e)
//       debugger
//     }
//   };
// };


export const getLocationThunk = (lat, lng) => {
  return async (dispach) => {
    try{
      let response = await geolocationAPI.getLocationCity(lat, lng);
      
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

      let shortName = getShortAddressObject(response.data.results)
      let longName = getLongAddressObject(response.data.results)

      // debugger
      dispach(setLocality({
        city: longName.locality ? longName.locality : longName.administrative_area_level_1,
        country: shortName.country
      }));
    }catch(e){
      // debugger
      // alert(e.response.data.message)
    }
  };
};



export default geolocationReducer;
