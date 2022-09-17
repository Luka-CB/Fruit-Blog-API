const express = require("express");
const {
  createLike,
  fetchUserLike,
  deleteLike,
  deleteLikedPostLike,
} = require("../controllers/likeControllers");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.route("/create").post(auth, createLike);
router.route("/fetchuserlike/:id").get(auth, fetchUserLike);
router.route("/delete/:id").delete(auth, deleteLike);
router.route("/unlike/:postId").delete(auth, deleteLikedPostLike);

module.exports = router;
