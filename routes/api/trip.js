var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var verifyToken = require('../helpers').verifyToken;
const dictionary = require('../tripDictionary');

/* Get riders by age groups given a day and one or more stations */
router.post('/ageGroups', verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRET, async (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const stations = req.body.stations.split(',');
        const date = req.body.day;
        const trips = dictionary.getAgeGroups(stations, date);
        res.send(trips);
      } catch (error) {
        console.log(error);
      }
    }
  });
});

/* Given one or more stations, get last 20 trips ending at each station for a given day */
router.post('/byStation', verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRET, async (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const stations = req.body.stations.split(',');
        const date = req.body.day;
        let trips = {};
        for (let i = 0; i < stations.length; i++) {
          trips[stations[i]] = dictionary.getStationLastTrips(
            stations[i],
            date
          );
        }
        res.send(trips);
      } catch (error) {
        console.log(error);
      }
    }
  });
});

module.exports = router;
