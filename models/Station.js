var mongoose = require('mongoose');

var stationSchema = new mongoose.Schema({
  stationName: String,
});

module.exports = mongoose.model('Station', stationSchema);
