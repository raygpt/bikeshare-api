var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var verifyToken = require('../helpers').verifyToken;
var helper = require('../helpers');

/* Get station by ID */
router.get('/:id', verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.SECRET, async (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const matchingStation = await helper.getStationData(req);
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
