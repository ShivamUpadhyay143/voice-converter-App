const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// DB connection
mongoose.connect("mongodb://localhost:27017/voiceApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema
const SpeechSchema = new mongoose.Schema({
  text: String,
  type: String, // "TTS" or "STT"
  timestamp: { type: Date, default: Date.now },
});

const Speech = mongoose.model("Speech", SpeechSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.post("/save", async (req, res) => {
  const { text, type } = req.body;
  try {
    await new Speech({ text, type }).save();
    res.json({ message: "Saved" });
  } catch {
    res.status(500).json({ error: "Failed to save" });
  }
});

app.get("/history", async (req, res) => {
  const data = await Speech.find().sort({ timestamp: -1 }).limit(20);
  res.json(data);
});

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
