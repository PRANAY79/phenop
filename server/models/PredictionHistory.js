const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    predictions: [
      {
        date: { type: Date, default: Date.now },
        traits: { type: Object, required: true }
      }
    ],
  },
  { collection: "userhistories" }
);

module.exports = mongoose.model('PredictionHistory', predictionSchema);
