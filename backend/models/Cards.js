const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lists",
    required: true,
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
});

module.exports = mongoose.model("Card", cardSchema);
