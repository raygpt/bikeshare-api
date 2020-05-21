exports.URLS = {
  station: 'https://gbfs.divvybikes.com/gbfs/en/station_information.json',
  tripData:
    'https://s3.amazonaws.com/divvy-data/tripdata/Divvy_Trips_2019_Q2.zip',
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
