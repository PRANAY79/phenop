const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const diseaseRouter = require('./routes/diseases');
const predictionRouter = require('./routes/prediction');
const authRouter = require('./routes/auth');

const app = express();

// at top: ensure you have this import


// below other setup, add:
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:9000"], // Vite + Gateway
  credentials: true
}));



// FIX — allow big base64 image bodies
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err.message));

app.use('/api/auth', authRouter);
app.use('/api/predictions', predictionRouter);
app.use('/api/disease', diseaseRouter);

app.get("/", (req, res) => {
  res.send("Backend server up and running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
