const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Patient Schema
const Patient = mongoose.model("Patient", new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  appointments: [{ date: String, procedure: String }]
}));

// API Routes
app.post("/api/patients", async (req, res) => {
  const patient = new Patient(req.body);
  await patient.save();
  res.send(patient);
});

app.get("/api/patients", async (req, res) => {
  const patients = await Patient.find();
  res.send(patients);
});

// Social Media Auto-Posting (Example for Twitter)
const axios = require("axios");
app.post("/api/post-social", async (req, res) => {
  const { message } = req.body;
  const twitterApiUrl = "https://api.twitter.com/2/tweets";
  
  try {
    const response = await axios.post(twitterApiUrl, { text: message }, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    res.send(response.data);
  } catch (error) {
    res.status(500).send(error.response.data);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
