const cookie = require("cookie");
const asyncHandler = require("express-async-handler");
const generateToken = require("../config/utils");
const User = require("../models/User.js");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const Post = require("../models/Post");
const Reply = require("../models/Reply");

// REGISTER USER
// ROUTE - POST - /api/users/register
// PUBLIC
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists)
    throw new Error("User with the Same Username Already Exists!");

  const newUser = await User.create({
    username,
    email,
    password,
  });

  if (!newUser) throw new Error("Registration Failed!");

  const token = generateToken(newUser._id);

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "none",
      path: "/",
    })
  );

  res.status(200).json({
    id: newUser._id,
    username: newUser.username,
    isAdmin: newUser.isAdmin,
  });
});

// LOGIN USER
// ROUTE - POST - /api/users/login
// PUBLIC
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) throw new Error("Username is Incorrect!");
  if (!(await user.matchPassword(password)))
    throw new Error("Password is Incorrect!");

  const token = generateToken(user._id);

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "none",
      path: "/",
    })
  );

  res.status(200).json({
    id: user._id,
    username: user.username,
    isAdmin: user.isAdmin,
  });
});

// GET CURRENT USER
// ROUTE - GET - /api/users/current
// PRIVATE - USER
const fetchUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  if (!user) throw new Error("Get Current User Request has Failed!");

  res.status(200).json(user);
});

// GET ALL USERS
// ROUTE - GET - /api/users/fetchall
// PRIVATE - ADMIN
const fetchUsers = asyncHandler(async (req, res) => {
  const { searchQ, sort, page } = req.query;

  const keyword = searchQ
    ? {
        $or: [
          { username: { $regex: searchQ, $options: "i" } },
          { email: { $regex: searchQ, $options: "i" } },
        ],
      }
    : {};

  let sortVal;
  if (sort === "asc") {
    sortVal = { createdAt: "asc" };
  } else {
    sortVal = { createdAt: "desc" };
  }

  const filter = { ...keyword };
  const options = {
    sort: sortVal,
    page: page || 1,
    limit: 12,
  };

  const users = await User.paginate(filter, options);
  const count = await User.countDocuments(filter);

  if (!users) throw new Error("Fetch Users Request has failed!");
  res.status(200).json({ users, count });
});

// UPDATE USER ACCOUNT
// ROUTE - PUT - /api/users/update
// PRIVATE - USER
const updateAccount = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    user.username = username || user.username;
    user.email = email || user.email;
    if (password) user.password = password;
  }

  const updatedUser = user.save();

  if (!updatedUser) throw new Error("Update User Request has Failed!");
  res.status(200).send("success");
});

// DELETE USER ACCOUNT
// ROUTE - DELETE - /api/users/delete
// PRIVATE - USER
const deleteAccount = asyncHandler(async (req, res) => {
  const deletedUser = await User.findOneAndDelete({ _id: req.user._id });
  if (!deletedUser) throw new Error("Delete User Account has Failed!");

  const commentIds = deletedUser.comments.map((comm) => comm);
  const comments = await Comment.find({ _id: { $in: commentIds } });
  const replyIds = comments
    .map((comm) => comm.replies.map((rep) => rep))
    .flat();
  const likeIds = deletedUser.likes.map((like) => like);

  await Post.updateMany({
    $pull: { comments: { $in: commentIds }, likes: { $in: likeIds } },
  });
  await Comment.deleteMany({ _id: { $in: commentIds } });
  await Reply.deleteMany({ _id: { $in: replyIds } });
  await Like.deleteMany({ _id: { $in: likeIds } });

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0),
      sameSite: "none",
      path: "/",
    })
  );

  res.status(200).send("success");
});

// EDIT USER ACCOUNT BY ADMIN
// ROUTE - PUT - /api/users/admin/edit/:id
// PRIVATE - ADMIN
const editUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, isAdmin } = req.body;

  const user = await User.findById(id);

  if (user) {
    user.username = username || user.username;
    user.email = email || user.email;
    user.isAdmin = isAdmin;
  }

  const updatedUser = await user.save();
  if (!updatedUser) throw new Error("Edit User Request has Failed");

  res.status(200).send("success");
});

// DELETE USER ACCOUNT BY ADMIN
// ROUTE - DELETE - /api/users/admin/delete/:id
// PRIVATE - ADMIN
const deleteUserAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedUser = await User.findOneAndDelete({ _id: id });
  if (!deletedUser) throw new Error("Delete User Account has Failed!");

  const commentIds = deletedUser.comments.map((comm) => comm);
  const comments = await Comment.find({ _id: { $in: commentIds } });
  const replyIds = comments
    .map((comm) => comm.replies.map((rep) => rep))
    .flat();
  const likeIds = deletedUser.likes.map((like) => like);

  await Post.updateMany({
    $pull: { comments: { $in: commentIds }, likes: { $in: likeIds } },
  });
  await Comment.deleteMany({ _id: { $in: commentIds } });
  await Reply.deleteMany({ _id: { $in: replyIds } });
  await Like.deleteMany({ _id: { $in: likeIds } });

  res.status(200).send("success");
});

// LOGOUT USER
// ROUTE - GET - /api/users/logout
// PRIVATE - USER
const logout = asyncHandler(async (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0),
      sameSite: "none",
      path: "/",
    })
  );

  res.send("Logged Out");
});

module.exports = {
  register,
  logout,
  login,
  fetchUser,
  fetchUsers,
  updateAccount,
  deleteAccount,
  editUser,
  deleteUserAccount,
};
