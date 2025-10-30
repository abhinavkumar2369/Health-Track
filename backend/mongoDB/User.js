const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true },
  profession: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
