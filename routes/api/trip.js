var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var AdmZip = require('adm-zip');
var axios = require('axios');
var verifyToken = require('../helpers').verifyToken;
var tripDataURL = require('../helpers').URLS.tripData;

const getTripData = (req, res) => {
  axios
    .get(tripDataURL, {
      responseType: 'arraybuffer',
    })
    .then((response) => {
      return new AdmZip(response.data);
    })
    .then((zip) => {
      var zipEntries = zip.getEntries();
      for (var i = 0; i < zipEntries.length; i++) {
        console.log(zip.readAsText(zipEntries[i]));
      }
    });
};

router.get('/', verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRET, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        getTripData(req, res);
      } catch (error) {
        console.log(error);
      }
    }
  });
});

module.exports = router;
