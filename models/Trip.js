var mongoose = require('mongoose');

var tripSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  startStation: String,
  endStation: String,
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
});

module.exports = mongoose.model('Trip', tripSchema);
