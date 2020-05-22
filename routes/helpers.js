const fs = require('fs'),
  child_process = require('child_process'),
  tmp = require('tmp'),
  moment = require('moment');

exports.URLS = {
  station: 'https://gbfs.divvybikes.com/gbfs/en/station_information.json',
  tripData:
    'https://s3.amazonaws.com/divvy-data/tripdata/Divvy_Trips_2019_Q2.zip',
};

/* Converting to JSON is expensive, so we only do it after grepping for elements in the file that match our query.
   Using map and split is an efficient way to do this mapping without resorting to typical O(n2) complexity of 
   JSON parsing. Though this code is technically O(n2) in the worst case due to .map(), the worst case is very 
   unlikely to happen since each individual string is short (and predictably so). Since split is O(n), map is O(n) 
   and chaining O(n) operations still results in linear complexity, the complexity of this code is O(n), where n is 
   number of characters in the entire stdout string.*/

function parseMatchesToJSON(stdout) {
  // clean up the data before parsing
  stdout = stdout.replace(/\n$/, '');
  const matchesArray = stdout.split('\n').map((element) => ({
    [moment(element.split(',')[2]).format('YYYY-MM-DD')]: {
      startDate: element.split(',')[1],
      endDate: element.split(',')[2],
      startStation: `${element.split(',')[5]} ${element.split(',')[6]}`,
      endStation: `${element.split(',')[7]} ${element.split(',')[8]}`,
      memberType: element.split(',')[9],
      gender: element.split(',')[10],
      birthYear: element.split(',')[11],
    },
  }));

  return matchesArray;
}

/* Stream the zip file's data to a temporary file and spawn a grep child shell process 
(which is infinitely faster and less cpu-intensive than any hand-spun i/o javascript)
 to return all the lines that contain the specific date we're looking for, deleting the temporary file 
 after we finish the analysis. 
 I could have used ack instead of grep for even faster searching, but that
 would require some extra OS dependencies to run on a different server and I didn't want to overengineer this.
*/
exports.grep = function grepWithFork(data, pattern) {
  return new Promise(async (resolve) => {
    tmp.file(function _tempFileCreated(err, path, fd, cleanupCallback) {
      if (!err) {
        /* I really didn't want to put this in a temporary file and tried for a while to try and pipe the data
         directly to grep but debugging stdin/out on a forked multi-core process was taking me a long time and 
         I needed to move forward. I would probably try to pipe it directly if I had the time. */
        fs.write(fd, data, (err) => {
          if (err) {
            console.log(err);
          }
        });
        fs.close(fd, function (err) {
          // set a large max buffer size or the data will be truncated
          child_process.exec(
            `grep ${pattern} ${path}`,
            { maxBuffer: 200000000 },
            function (err, stdout) {
              resolve(parseMatchesToJSON(stdout));
              // remove temp file after promise is resolved
              cleanupCallback();
            }
          );
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
