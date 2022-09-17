const express = require("express");
const {
  createComment,
  fetchAllComments,
  createReply,
  fetchAllReplies,
  updateComment,
  deleteComment,
  updateReply,
  deleteReply,
} = require("../controllers/commentControllers");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.route("/create").post(auth, createComment);
router.route("/fetchall").get(fetchAllComments);
router.route("/update/:id").put(auth, updateComment);
router.route("/delete/:id").delete(auth, deleteComment);
router.route("/replies/create").post(auth, createReply);
router.route("/replies/fetchall/:id").get(fetchAllReplies);
router.route("/replies/update/:id").put(auth, updateReply);
router.route("/replies/delete/:id").delete(auth, deleteReply);

module.exports = router;
