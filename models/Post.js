const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "draft",
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
