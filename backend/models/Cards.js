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
      _id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
      },
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
  pomodoroTarget: {
    type: Number,
    default: 1,
  },
  pomodoros: [
    {
      id: {
        type: String,
        required: true,
      },
      completedAt: {
        type: Date,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
    },
  ],
  recurrence: {
    type: String,
    enum: ["none", "daily", "weekly"],
    default: "none",
  },
});

module.exports = mongoose.model("Card", cardSchema);
