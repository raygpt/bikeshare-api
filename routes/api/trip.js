var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var AdmZip = require('adm-zip');
var axios = require('axios');
var verifyToken = require('../helpers').verifyToken;
var tripDataURL = require('../helpers').URLS.tripData;
var grep = require('../helpers').grep;

const getTripData = (req) => {
  axios
    .get(tripDataURL, {
      responseType: 'arraybuffer',
    })
    .then((response) => {
      return new AdmZip(response.data);
    })
    .then((zip) => {
      var zipEntries = zip.getEntries();
      // the data is in the first entry of the zip file, all other entries are metadata
      // TODO: pass correct date string
      return grep(zipEntries[0].getData().toString(), req.body.day);
    })
    .then((matchArray) => {
      return matchArray;
    });
};

router.post('/ageGroups', verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRET, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        res.json(getTripData(req));
      } catch (error) {
        console.log(error);
      }
    }
  });
});

module.exports = router;
