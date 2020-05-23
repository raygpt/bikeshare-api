const axios = require('axios'),
  AdmZip = require('adm-zip'),
  csvString = require('csv-string'),
  dictionary = require('./tripDictionary');

const URLS = {
  station: 'https://gbfs.divvybikes.com/gbfs/en/station_information.json',
  tripData:
    'https://s3.amazonaws.com/divvy-data/tripdata/Divvy_Trips_2019_Q2.zip',
};

exports.getStationData = (req) => {
  const matchingStation = axios.get(URLS.station).then((response) => {
    const allStations = response.data.data.stations;
    return allStations.filter(
      (station) => station.station_id === req.params.id
    );
  });

  return matchingStation;
};

exports.initDictionary = async function initDictionary() {
  let response = await axios.get(URLS.tripData, {
    responseType: 'arraybuffer',
  });
  let zip = new AdmZip(response.data);
  let zipEntries = zip.getEntries();
  let trips = csvString.parse(zipEntries[0].getData().toString());
  for (let i = 1; i < trips.length; i++) {
    let trip = {
      tripID: trips[i][0],
      startDate: trips[i][1],
      endDate: trips[i][2],
      bikeID: trips[i][3],
      duration: trips[i][4],
      startStationID: trips[i][5],
      startStationName: trips[i][6],
      endStationID: trips[i][7],
      endStationName: trips[i][8],
      memberType: trips[i][9],
      gender: trips[i][10],
      birthYear: trips[i][11],
    };
    dictionary.addTrip(trip);
  }
  dictionary.finalize();
};

exports.verifyToken = async function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader != 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
};
