const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },

  // Email verification fields
  verified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationExpires: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
