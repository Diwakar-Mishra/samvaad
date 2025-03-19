const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require("./config");  // Import the Mongoose model

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use EJS as the view engine
app.set('view engine', 'ejs');

// Static file
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
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
      password: hashedPassword
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
    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);

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


const port = 5000;
app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});
