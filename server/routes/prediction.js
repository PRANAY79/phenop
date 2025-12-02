const express = require('express');
const router = express.Router();
const PredictionHistory = require('../models/PredictionHistory');

// POST: Save prediction history
router.post('/', async (req, res) => {
  console.log("🔥🔥 PREDICTION POST ROUTE HIT 🔥🔥");

  const { username, traits } = req.body;
  console.log("[API] Received prediction POST:", { username, traits });

  try {
    let userHistory = await PredictionHistory.findOne({ username });

    if (userHistory) {
      console.log("➡ Existing user found. Appending new prediction...");
      userHistory.predictions.push({ traits });
      await userHistory.save();
      console.log("✔ Prediction appended successfully");
    } else {
      console.log("➡ No user history. Creating a new record...");
      userHistory = new PredictionHistory({
        username,
        predictions: [{ traits }],
      });
      await userHistory.save();
      console.log("✔ New prediction history created");
    }

    res.status(201).json({ message: "Prediction saved." });
  } catch (err) {
    console.error("[API] Error saving prediction:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch prediction history
router.get('/:username', async (req, res) => {
  console.log("📥 Fetching prediction history for:", req.params.username);

  try {
    const history = await PredictionHistory.findOne({
      username: req.params.username
    });

    if (!history) {
      console.log("⚠ No prediction history found for:", req.params.username);
      return res.json({ predictions: [] });
    }

    console.log("✔ History found and returned");
    res.json(history);
  } catch (err) {
    console.error("[API] Error fetching history:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
