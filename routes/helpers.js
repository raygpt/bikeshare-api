// calling .track() allows for automatic deletion of all temp files after process close
var temp = require('temp').track(),
  fs = require('fs'),
  child_process = require('child_process');

exports.URLS = {
  station: 'https://gbfs.divvybikes.com/gbfs/en/station_information.json',
  tripData:
    'https://s3.amazonaws.com/divvy-data/tripdata/Divvy_Trips_2019_Q2.zip',
};

function loadMatchesToArray(stdout) {
  var matches = stdout.split('\n');
  return matches;
}

/* stream the zip file's data to a temporary file and spawn a grep child shell process 
(which is infinitely faster and less cpu-intensive than any hand-spun i/o javascript)
 to return all the lines that contain the specific date we're looking for, deleting the temporary file 
 after we finish the analysis
*/

exports.grep = function grepWithFork(data, pattern) {
  return new Promise(async (resolve) => {
    temp.open('tempFile', function (err, info) {
      if (!err) {
        /* i really didn't want to put this in a temporary file and tried for hours to try and pipe the data
         directly to grep but the file string was too big to pass as an argument (grep only allows you to pass 
          strings of up to 128kb) */
        fs.write(info.fd, data, (err) => {
          if (err) {
            console.log(err);
          }
        });
        fs.close(info.fd, function (err) {
          child_process.exec(`grep ${pattern} ${info.path}`, function (
            err,
            stdout
          ) {
            resolve(loadMatchesToArray(stdout));
          });
        });
      }
    });
  });
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
