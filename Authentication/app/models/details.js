var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DetailSchema = new Schema({
  userName: String,
  userPno: Number,
  userEmail: String,
  userPassword:String,
});

module.exports = mongoose.model('Details',DetailSchema);