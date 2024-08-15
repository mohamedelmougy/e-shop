const express = require("express");

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData
} = require("../services/userService");

const authService = require("../services/authService");

const router = express.Router();
router.use(authService.protect);

router.get("/get-me", getLoggedUserData, getUser);
router.put("/update-my-password", updateLoggedUserPassword);
router.put("/update-me", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/delete-me", deleteLoggedUserData);

// admin
router.use(authService.allowedTo("admin", "manager"));

router.put(
  "/change-password/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(updateUserValidator, uploadUserImage, resizeImage, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
