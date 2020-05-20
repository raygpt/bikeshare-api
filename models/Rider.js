var mongoose = require('mongoose');

var riderSchema = new mongoose.Schema({
  name: String,
  gender: String,
  birthYear: String,
  riderType: String,
});

module.exports = mongoose.model('Rider', riderSchema);
