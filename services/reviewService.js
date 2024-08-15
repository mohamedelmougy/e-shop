const factory = require("./handlerFactory");
const Reviews = require("../models/reviewModel");

// Nested route
// GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// @desc     get list of reviews
// @route    GET /api/v1/reviews
// @access   Public
exports.getReviews = factory.getAll(Reviews);

// @desc     get specific review by id
// @route    POST /api/v1/reviews/:id
// @access   public
exports.getReview = factory.getOne(Reviews);

// Nested route (create)
exports.setProductIdAndUserIdForBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc     create specific review
// @route    PUT /api/v1/reviews
// @access   private/protect/user
exports.createReview = factory.createOne(Reviews);

// @desc     update specific review
// @route    PUT /api/v1/reviews/:id
// @access   private/protect/user
exports.updateReview = factory.updateOne(Reviews);

// @desc     delete specific review
// @route    DELETE /api/v1/reviews/:id
// @access   private/protect/User-Mdmin-Manager
exports.deleteReview = factory.deleteOne(Reviews);
