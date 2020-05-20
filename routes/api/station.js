var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var axios = require('axios');
var verifyToken = require('../helpers').verifyToken;
var stationURL = require('../helpers').stationURL;

const getStationData = async (req) => {
  const matchingStation = axios.get(stationURL).then((response) => {
    const allStations = response.data.data.stations;
    return allStations.filter(
      (station) => station.station_id === req.params.id
    );
  });

  return matchingStation;
};

/* 1. Get station by ID */
router.get('/:id', verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.SECRET, async (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const matchingStation = await getStationData(req);
        if (matchingStation.length > 0) {
          res.json({
            station: matchingStation,
          });
        } else {
          res.json({
            message: 'Sorry, no station with that ID exists.',
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
});

module.exports = router;
