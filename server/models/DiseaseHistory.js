const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
  en: { type: [String], default: [] },
  te: { type: [String], default: [] },
  hi: { type: [String], default: [] }
}, { _id: false });

const TraitsSchema = new mongoose.Schema({
  prediction: { type: String, required: true },
  confidence: { type: Number, required: true },
  caption: { type: String, default: null },
  suggestions: { type: SuggestionSchema, default: {} },
  image_base64: { type: String, default: null },
  filename: { type: String, default: null },
  comment: { type: String, default: "" }
}, { _id: false });

const PredictionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  traits: { type: TraitsSchema, required: true }
});

const DiseaseHistorySchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true },
    predictions: { type: [PredictionSchema], default: [] }
  },
  { collection: "disease_user_histories" }
);

module.exports = mongoose.model('DiseaseHistory', DiseaseHistorySchema);
