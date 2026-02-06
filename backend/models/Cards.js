const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  completed: {
    type: Boolean,
    default: false,
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
  position: {
    type: Number,
    required: true,
    default: 0,
  },
  deadline: { type: Date, default: null },
  labels: [
    {
      color: String,
      text: String,
    },
  ],
  checklist: [
    {
      subTitle: {
        type: String,
        required: true,
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model("Card", cardSchema);
