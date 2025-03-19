import mongoose from "mongoose";
// const mongoose = require("mongoose");

// Connect to MongoDB database
mongoose
  .connect("mongodb://127.0.0.1:27017/Login", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.log("Database cannot be connected", error);
  });

// Create a schema
const LoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  password: {
    type: String,
    required: true,
  },
});

// Create a model based on the schema
const User = mongoose.model("users", LoginSchema);

// Export the model
export default User;
