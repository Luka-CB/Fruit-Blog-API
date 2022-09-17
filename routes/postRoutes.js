const express = require("express");
const {
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
} = require("../controllers/postControllers");
const { auth, admin } = require("../middlewares/auth");

const router = express.Router();

router.route("/create").post(auth, admin, createPost);
router.route("/fetchall").get(fetchPosts);
router.route("/fetchone/:id").get(fetchPost);
router.route("/fetchsome").get(fetchOtherPosts);
router.route("/latest").get(fetchLatest);
router.route("/update/:id").put(auth, admin, updatePost);
router.route("/update/status/:id").put(auth, admin, updateStatus);
router.route("/delete/:id").delete(auth, admin, deletePost);
router.route("/fetchliked").get(auth, fetchLikedPosts);
router.route("/fetchdraft").get(auth, admin, fetchDraft);

module.exports = router;
