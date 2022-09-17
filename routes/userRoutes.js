const express = require("express");
const {
  register,
  login,
  fetchUser,
  logout,
  updateAccount,
  deleteAccount,
  fetchUsers,
  editUser,
  deleteUserAccount,
} = require("../controllers/userControllers.js");
const { auth, admin } = require("../middlewares/auth");

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/current").get(auth, fetchUser);
router.route("/fetchall").get(auth, admin, fetchUsers);
router.route("/update").put(auth, updateAccount);
router.route("/delete").delete(auth, deleteAccount);
router.route("/logout").get(auth, logout);
router.route("/admin/edit/:id").put(auth, admin, editUser);
router.route("/admin/delete/:id").delete(auth, admin, deleteUserAccount);

module.exports = router;
