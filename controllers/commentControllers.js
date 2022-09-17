const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const Reply = require("../models/Reply");
const User = require("../models/User");
const Post = require("../models/Post");

// CREATE NEW COMMENT
// ROUTE - POST - /api/comments/create
// PRIVATE - USER
const createComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { postId } = req.query;

  const newComment = await Comment.create({
    body: comment,
    author: req.user._id,
    post: postId,
  });
  if (!newComment) throw new Error("Create Comment Request has Failed!");

  await Post.updateMany(
    { _id: postId },
    { $push: { comments: newComment._id } }
  );
  await User.updateMany(
    { _id: req.user._id },
    { $push: { comments: newComment._id } }
  );

  res.status(200).send("success");
});

// GET COMMENTS
// ROUTE - GET - /api/comments/fetchall
// PUBLIC
const fetchAllComments = asyncHandler(async (req, res) => {
  const { postId } = req.query;

  const comments = await Comment.find({ post: postId })
    .sort({
      createdAt: "desc",
    })
    .populate("author", "username");

  const count = await Comment.countDocuments({ post: postId });

  if (!comments) throw new Error("Get Comments Request has Failed!");
  res.status(200).json({ comments, count });
});

// UPDATE COMMENT
// ROUTE - PUT - /api/comments/update/:id
// PRIVATE - USER
const updateComment = asyncHandler(async (req, res) => {
  const { body } = req.body;
  const { id } = req.params;

  const filter = { _id: id };
  const data = { body };
  const updatedComment = await Comment.updateOne(filter, data);

  if (!updatedComment) throw new Error("Update Comment Request has Failed!");
  res.status(200).send("success");
});

// DELETE COMMENT
// ROUTE - DELETE - /api/comments/delete/:id
// PRIVATE - USER
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedComment = await Comment.findOneAndDelete({ _id: id });
  if (!deletedComment) throw new Error("Delete Comment Request has Failed!");

  await User.updateMany({ _id: req.user._id }, { $pull: { comments: id } });
  await Post.updateMany(
    { _id: deletedComment.post },
    { $pull: { comments: id } }
  );
  await Reply.deleteMany({ comment: id });

  res.status(200).send("success");
});

// CREATE COMMENT REPLY
// ROUTE - POST - /api/comments/replies/create
// PRIVATE - USER
const createReply = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  const { commentId } = req.query;

  const newReply = await Reply.create({
    reply,
    author: req.user._id,
    comment: commentId,
  });
  if (!newReply) throw new Error("Create Reply Request has Failed!");

  await Comment.updateMany(
    { _id: commentId },
    { $push: { replies: newReply._id } }
  );

  res.status(200).send("success");
});

// GET COMMENT REPLIES
// ROUTE - GET - /api/comments/replies/fetchall/:id
// PUBLIC
const fetchAllReplies = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const replies = await Reply.find({ comment: id })
    .sort({ createdAt: "desc" })
    .populate("author", "username");
  const count = await Reply.countDocuments({ comment: id });

  if (!replies) throw new Error("Fetch All Replies Request has Failed!");
  res.status(200).json({ replies, count });
});

// UPDATE REPLY
// ROUTE - PUT - /api/comments/replies/update/:id
// PRIVATE - USER
const updateReply = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  const { id } = req.params;

  const filter = { _id: id };
  const data = { reply };
  const updatedReply = await Reply.updateOne(filter, data);

  if (!updatedReply) throw new Error("Update Reply Request has Failed!");
  res.status(200).send("success");
});

// DELETE REPLY
// ROUTE - DELETE - /api/commments/replies/delete/:id
// PRIVATE - USER
const deleteReply = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedReply = await Reply.findOneAndDelete({ _id: id });
  if (!deletedReply) throw new Error("Delete Reply Request has Failed!");

  await Comment.updateMany(
    { _id: deletedReply.comment },
    { $pull: { replies: id } }
  );

  res.status(200).send("success");
});

module.exports = {
  createComment,
  fetchAllComments,
  createReply,
  fetchAllReplies,
  updateComment,
  deleteComment,
  updateReply,
  deleteReply,
};
