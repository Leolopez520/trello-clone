const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  color: {
    type: String,
    default: "#0079bf",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Board", boardSchema);
