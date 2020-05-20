var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var axios = require('axios');
const JSZip = require('jszip');
var verifyToken = require('../helpers').verifyToken;
var tripDataURL = require('../helpers').tripDataURL;

const getTripData = async (req, res) => {
  axios
    .get(tripDataURL, {
      responseType: 'arraybuffer',
    })
    .then((response) => {
      return JSZip.loadAsync(response.data);
    })
    .then((zip) => {
      console.log(zip);
    });
};

router.get('/', verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.SECRET, async (err) => {
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
