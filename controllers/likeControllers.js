const asyncHandler = require("express-async-handler");
const Like = require("../models/Like");
const Post = require("../models/Post");
const User = require("../models/User");

// CREATE LIKE
// ROUTE - POST - /api/likes/create
// PRIVATE - USER
const createLike = asyncHandler(async (req, res) => {
  const { postId } = req.query;

  const newLike = await Like.create({
    author: req.user._id,
    post: postId,
  });
  if (!newLike) throw new Error("Create Like Request has Failed!");

  await Post.updateMany({ _id: postId }, { $push: { likes: newLike._id } });
  await User.updateMany(
    { _id: req.user._id },
    { $push: { likes: newLike._id } }
  );

  res.status(200).send("success");
});

// GET USER LIKE
// ROUTE - GET - /api/likes/fetchuserlike/:id
// PRIVATE - USER
const fetchUserLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const like = await Like.findOne({ author: req.user._id, post: id });
  if (!like) throw new Error("Fetch User Like Request has Failed!");

  res.status(200).json({ id: like._id });
});

// DELETE LIKE
// ROUTE - DELETE - /api/likes/delete/:id
// PRIVATE - USER
const deleteLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedLike = await Like.findOneAndDelete({ _id: id });
  if (!deletedLike) throw new Error("Delete Like Request has Failed!");

  await Post.updateMany({ _id: deletedLike.post }, { $pull: { likes: id } });
  await User.updateMany({ _id: req.user._id }, { $pull: { likes: id } });

  res.status(200).send("success");
});

// DELETE LIKED POST LIKE
// ROUTE - DELETE - /api/likes/unlike/:postId
// PRIVATE - USER
const deleteLikedPostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const deletedLike = await Like.findOneAndDelete({
    author: req.user._id,
    post: postId,
  });
  if (!deletedLike) throw new Error("Delete Like Request has Failed!");

  await Post.updateMany(
    { _id: deletedLike.post },
    { $pull: { likes: deletedLike._id } }
  );
  await User.updateMany(
    { _id: req.user._id },
    { $pull: { likes: deletedLike._id } }
  );

  res.status(200).send("success");
});

module.exports = {
  createLike,
  fetchUserLike,
  deleteLike,
  deleteLikedPostLike,
};
