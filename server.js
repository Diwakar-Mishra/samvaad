import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import User from "./src/config.js";
import bcrypt from "bcrypt";
// const bcrypt = require("bcrypt");

// const User = require("./src/config"); // Import the Mongoose model

const app = express();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
const token = process.env["AZURE_OPENAI_KEY"];

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: token,
});

async function analyzeDebate(debate) {
  const systemPrompt = `
  You are an AI debate analyzer. Given a debate, score each participant based on:
  - Speech Clarity & Coherence (0-100)
  - Relevance to Topic (0-100)
  - Engagement & Participation (0-100)
  - Logical Strength (0-100)
  - Counterarguments & Rebuttals (0-100)

  Respond strictly in a **valid JSON format** without any extra text.
  Example:
  {
    "participants": [
      { "name": "Alice", "scores": { "clarity": 90, "relevance": 85, "engagement": 80, "logic": 88, "rebuttals": 75 } },
      { "name": "Bob", "scores": { "clarity": 85, "relevance": 80, "engagement": 85, "logic": 90, "rebuttals": 80 } }
    ]
  }
  `;

  const userPrompt = `Debate Data:\n${JSON.stringify(debate, null, 2)}`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    let result = response.choices[0].message.content;

    // 🔹 **Fix: Remove markdown backticks from response**
    result = result.replace(/```json|```/g, "").trim();

    // 🔹 **Ensure valid JSON**
    try {
      return JSON.parse(result);
    } catch (parseError) {
      return {
        error: "AI returned an improperly formatted response",
        raw: result,
      };
    }
  } catch (err) {
    return { error: "Failed to analyze debate", details: err.message };
  }
}
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/deshboard", (req, res) => {
  res.render("index");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/about", (req, res) => {
  res.render("AboutUs");
});

// Register User
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(400).send("User already exists");
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email: email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    console.log("User registered:", newUser);
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
});

// Login User
app.post("/login", async (req, res) => {
  try {
    // Find the user by username (email)
    const check = await User.findOne({ email: req.body.email });

    if (!check) {
      return res.send("Username not found");
    }

    // Compare the hash password from the database with the plain text password
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password
    );

    if (isPasswordMatch) {
      // If the password matches, render the home page
      res.render("home");
    } else {
      // If the password does not match
      return res.send("Incorrect password");
    }
  } catch (error) {
    // If there is any error in the process
    console.error("Error during login:", error);
    return res.send("Wrong details or error in login");
  }
});

app.post("/analyze-debate", async (req, res) => {
  const debate = req.body.debate;

  if (!debate || !Array.isArray(debate)) {
    return res.status(400).json({
      error: "Invalid input. Expected an array of { name, speech } objects.",
    });
  }

  const analysis = await analyzeDebate(debate);
  res.json(analysis);
});
let debates = [];

app.post("/create-debate", (req, res) => {
  const { organizer, topic, time } = req.body;
  const joinCode = Math.random().toString(36).substr(2, 6).toUpperCase();

  const newDebate = {
    organizer,
    topic,
    time,
    joinCode,
    participants: [],
  };

  debates.push(newDebate);
  res.redirect(`/debate-room/${joinCode}`);
});

app.get("/debate-room/:code", (req, res) => {
  const debate = debates.find((d) => d.joinCode === req.params.code);

  if (!debate) {
    return res.send("Debate not found.");
  }

  res.render("debate-room", { debate });
});

app.post("/join-debate", (req, res) => {
  const { name, code } = req.body;
  const debate = debates.find((d) => d.joinCode === code);

  if (debate) {
    if (!debate.participants.includes(name)) {
      debate.participants.push(name);
    }
    res.redirect(`/debate-room/${code}`);
  } else {
    res.send("Invalid join code. Try again.");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
