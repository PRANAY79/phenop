const express = require('express');
const router = express.Router();
const DiseaseHistory = require('../models/DiseaseHistory');

// Node v18+ has global fetch
async function translateText(text, target) {
  if (!text) return text;
  try {
    const resp = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target,
        format: "text"
      }),
    });

    if (!resp.ok) return text;
    const data = await resp.json();
    return data.translatedText || text;
  } catch (err) {
    console.log("Translate error:", err.message);
    return text;
  }
}

// POST /api/disease
router.post("/", async (req, res) => {
  try {
    const {
      username,
      prediction,
      confidence,
      caption,
      suggestions,
      filename,
      image_base64
    } = req.body;

    if (!username || !prediction || confidence === undefined) {
      return res.status(400).json({ error: "username, prediction, confidence required" });
    }

    const englishSuggestions = Array.isArray(suggestions) ? suggestions : [];

    const [teArr, hiArr] = await Promise.all([
      Promise.all(englishSuggestions.map(s => translateText(s, "te"))),
      Promise.all(englishSuggestions.map(s => translateText(s, "hi")))
    ]);

    const suggestionsObj = {
      en: englishSuggestions,
      te: teArr,
      hi: hiArr
    };

    const traits = {
      prediction,
      confidence: Number(confidence),
      caption: caption || null,
      suggestions: suggestionsObj,
      image_base64: image_base64 || null,
      filename: filename || null,
      comment: ""
    };

    let doc = await DiseaseHistory.findOne({ username });

    if (doc) {
      doc.predictions.push({ traits });
      await doc.save();
    } else {
      doc = new DiseaseHistory({
        username,
        predictions: [{ traits }]
      });
      await doc.save();
    }

    res.status(201).json({ message: "Saved", traits });

  } catch (err) {
    console.error("[disease POST] error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET history
router.get("/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const doc = await DiseaseHistory.findOne({ username });

    if (!doc) return res.json({ predictions: [] });

    return res.json(doc);
  } catch (err) {
    console.error("[disease GET] error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// PATCH comment
router.patch("/:username/:index", async (req, res) => {
  try {
    const { username, index } = req.params;
    const { comment } = req.body;

    const doc = await DiseaseHistory.findOne({ username });

    if (!doc) return res.status(404).json({ error: "No history found" });

    if (!doc.predictions[index]) {
      return res.status(400).json({ error: "Invalid index" });
    }

    doc.predictions[index].traits.comment = comment;
    await doc.save();

    res.json({ message: "Updated", record: doc.predictions[index] });

  } catch (err) {
    console.error("[disease PATCH] error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
