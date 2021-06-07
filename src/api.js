const axios = require("axios");

const getStates = () => {
  return new Promise(((resolve, reject) => axios({
      method: 'get',
      url: 'https://cdn-api.co-vin.in/api/v2/admin/location/states',
      headers: {'user-agent': 'Mozilla/5.0'}
    }).then(res => resolve(res.data)).catch((err) => reject(`${err}\nFailed to fetch states`))
  ))
}

const getDistricts = (stateId) => {
  return new Promise(((resolve, reject) => axios({
      method: 'get',
      url: `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`,
      headers: {'user-agent': 'Mozilla/5.0'}
    }).then(res => resolve(res.data)).catch((err) => reject(`${err}\nFailed to fetch districts`))
  ))
}

const getAvailableSessionsByDist = (districtId) => {
  const date = new Date();
  const dateString = `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`
  const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${dateString}`
  return new Promise(((resolve, reject) => axios({
      method: 'get',
      url,
      headers: {'user-agent': 'Mozilla/5.0'}
    }).then(res => resolve(res.data)).catch((err) => reject(`${err}\nFailed to fetch districts`))
  ))
}

module.exports = { getStates, getDistricts, getAvailableSessionsByDist }