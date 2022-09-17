const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Reply = require("../models/Reply");
const Like = require("../models/Like");
const asyncHandler = require("express-async-handler");
const { countDocuments } = require("../models/Post");

// CREATE NEW POST
// ROUTE - POST - /api/posts/create
// PRIVATE - ADMIN
const createPost = asyncHandler(async (req, res) => {
  const { title, body } = req.body;

  const postExists = await Post.findOne({ title });

  if (postExists)
    throw new Error(`The exact title: ${postExists.title} already exists`);

  const newPost = await Post.create({
    title,
    body,
  });

  if (!newPost) throw new Error("Create New Post Request has Failed!");

  res.status(200).send("success");
});

// GET POSTS
// ROUTE - GET - /api/posts/fetchall
// PUBLIC
const fetchPosts = asyncHandler(async (req, res) => {
  const { searchQ, sort } = req.query;

  const keyword = searchQ
    ? {
        title: {
          $regex: searchQ,
          $options: "i",
        },
      }
    : {};

  let sortVal;
  if (sort === "asc") {
    sortVal = { createdAt: "asc" };
  } else if (sort === "desc") {
    sortVal = { createdAt: "desc" };
  } else {
    sortVal = { createdAt: "desc" };
  }

  const posts = await Post.find({ status: "published", ...keyword })
    .sort(sortVal)
    .populate("likes", "author");
  const count = await Post.countDocuments({ status: "published", ...keyword });

  if (!posts) throw new Error("Fetch Posts Request has Failed!");
  res.status(200).json({ posts, count });
});

// GET POST BY ID
// ROUTE - GET - /api/posts/fetchone/:id
// PUBLIC
const fetchPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) throw new Error("Fetch Post Request has Failed!");
  res.status(200).json(post);
});

// GET SOME OTHER POSTS
// ROUTE - GET - /api/posts/fetchsome
// PUBLIC
const fetchOtherPosts = asyncHandler(async (req, res) => {
  const { postId } = req.query;

  const allPosts = await Post.find().populate("likes", "author");

  const posts = allPosts
    .filter((post) => post._id.toString() !== postId.toString())
    .slice(0, 6);

  res.status(200).json(posts);
});

// GET LATEST POST
// ROUTE - GET - /api/posts/latest
// PUBLIC
const fetchLatest = asyncHandler(async (req, res) => {
  const latestPost = await Post.findOne()
    .sort({ createdAt: "desc" })
    .populate("likes", "author");

  if (!latestPost) throw new Error("Get Latest Post Request has Failed!");
  res.status(200).json(latestPost);
});

// UPDATE POST
// ROUTE - PUT - /api/posts/update/:id
// PRIVATE - ADMIN
const updatePost = asyncHandler(async (req, res) => {
  const { body, title } = req.body;
  const { id } = req.params;

  const filter = { _id: id };
  const data = { title, body };
  const updatedPost = await Post.updateOne(filter, data);

  if (!updatedPost) throw new Error("Update Post Request has Failed!");
  res.status(200).send("success");
});

// DELETE POST
// ROUTE - DELETE - /api/posts/delete/:id
// PRIVATE - ADMIN
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedPost = await Post.findOneAndDelete({ _id: id });
  if (!deletedPost) throw new Error("Delete Post Request has Failed!");

  const commentIds = deletedPost.comments.map((comm) => comm);
  const likeIds = deletedPost.likes.map((like) => like);
  const comments = await Comment.find({ _id: { $in: commentIds } });
  const replyIds = comments.map((com) => com.replies.map((rep) => rep)).flat();

  await User.updateMany({ $pull: { likes: { $in: likeIds } } });
  await User.updateMany({ $pull: { comments: { $in: commentIds } } });
  await Reply.deleteMany({ _id: { $in: replyIds } });
  await Comment.deleteMany({ _id: { $in: commentIds } });
  await Like.deleteMany({ _id: { $in: likeIds } });

  res.status(200).send("success");
});

// GET LIKED POSTS
// ROUTE - GET - /api/posts/fetchliked
// PRIVATE - USER
const fetchLikedPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const likeIds = user.likes.map((like) => like);
  const posts = await Post.find({ likes: { $in: likeIds } }).populate(
    "likes",
    "createdAt author"
  );
  if (!posts) throw new Error("Get Liked Posts Request has Failed!");

  const count = await Post.countDocuments({ likes: { $in: likeIds } });

  const postsModified = posts.map((post) => {
    const like = post.likes.find(
      (like) => like.author.toString() === req.user._id.toString()
    );

    return { ...post._doc, likedAt: like.createdAt };
  });

  res.status(200).json({ posts: postsModified, count });
});

// GET UNPUBLISHED POSTS
// ROUTE - GET - /api/posts/fetchdraft
// PRIVATE - ADMIN
const fetchDraft = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: "draft" }).sort({
    createdAt: "desc",
  });
  const count = await Post.countDocuments({ status: "draft" });
  if (!posts) throw new Error("Fetch Draft Posts Request has Failed!");

  res.status(200).json({ posts, count });
});

// UPDATE POST STATUS
// ROUTE - PUT - /api/posts/update/status/:id
// PRIVATE - ADMIN
const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  let status;
  if (post.status === "draft") {
    status = "published";
  } else {
    status = "draft";
  }

  const test = await Post.findOneAndUpdate({ _id: id }, { status });

  res.status(200).json(test);
});

module.exports = {
  createPost,
  fetchPosts,
  fetchPost,
  fetchOtherPosts,
  fetchLatest,
  updatePost,
  deletePost,
  fetchLikedPosts,
  fetchDraft,
  updateStatus,
};
