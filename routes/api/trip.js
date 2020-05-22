var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var AdmZip = require('adm-zip');
var axios = require('axios');
var verifyToken = require('../helpers').verifyToken;
var tripDataURL = require('../helpers').URLS.tripData;
var grep = require('../helpers').grep;

const getTripData = (date) => {
  return axios
    .get(tripDataURL, {
      responseType: 'arraybuffer',
    })
    .then((response) => {
      return new AdmZip(response.data);
    })
    .then((zip) => {
      var zipEntries = zip.getEntries();
      // the data is in the first entry of the zip file, all other entries are metadata
      return grep(zipEntries[0].getData().toString(), date);
    })
    .then((matchArray) => {
      return matchArray;
    });
};

// work in progress method intended to figure out the best way to parse the trip data and get riders by age groups
const getRiderData = async (date, trips, stations) => {
  // stations should be passed from request but we're mocking it here for simplicity
  stations = ['195 Columbus Dr & Randolph St'];
  const ridersAtStationByDay = [];
  for (var day in trips) {
    if (trips.hasOwnProperty(day)) {
      ridersAtStationByDay.push(trips[day]);
    }
  }

  return ridersAtStationByDay;
};

// Get riders by age groups given a day and one or more stations
router.post('/ageGroups', verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRET, async (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const stations = req.body.stations;
        const date = req.body.day;
        const trips = await getTripData(date);
        const riders = await getRiderData(date, trips, stations);
        // res.send(trips);
      } catch (error) {
        console.log(error);
      }
    }
  });
});

module.exports = router;
