const express = require("express");

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require("../services/addressSercive");
const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));

router.route("/").post(addAddress).get(getLoggedUserAddresses);

router.delete("/:addressId", removeAddress);

module.exports = router;
