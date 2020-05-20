var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

/* 1. Get JWT token */
router.get('/token', async function (req, res) {
  // mock user for signing
  const user = {
    id: 1,
    username: 'divvy-tester',
  };

  jwt.sign({ user }, process.env.SECRET, (err, token) => {
    res.json({
      token,
    });
  });
});

module.exports = router;
