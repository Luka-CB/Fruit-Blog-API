const mongoose = require("mongoose");

const replySchema = mongoose.Schema(
  {
    reply: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  },
  {
    timestamps: true,
  }
);

const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;
