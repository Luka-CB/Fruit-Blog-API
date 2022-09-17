const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = Schema(
  {
    body: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    replies: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
