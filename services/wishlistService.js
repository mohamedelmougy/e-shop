const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc     Add product to wishlist
// @route    POST /api/v1/wishlist
// @access   protected/user
exports.addProductWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet ==> add productId to wishlist array if productId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist.",
    data: user.wishlist,
  });
});

// @desc     Remove product from wishlist
// @route    DELETE /api/v1/wishlist/:id
// @access   protected/user
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  // $pull ==> remove productId from wishlist array if productId exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishList: req.params.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product removed successfully from your wishlist.",
    data: user.wishList,
  });
});

// @desc     Get logged user wishlist
// @route    GET /api/v1/wishlist
// @access   protected/user
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res
    .status(200)
    .json({
      status: "success",
      result: user.wishlist.length,
      data: user.wishlist,
    });
});
