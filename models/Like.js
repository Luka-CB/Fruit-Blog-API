const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const likeSchema = Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
