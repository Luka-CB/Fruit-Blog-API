const asyncHandler = require("express-async-handler");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = asyncHandler(async (req, res, next) => {
  if (req.headers.cookie) {
    try {
      const { token } = cookie.parse(req.headers.cookie);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized, Token");
    }
  }
});

const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not Authorized as Admin");
  }
});

module.exports = { auth, admin };
