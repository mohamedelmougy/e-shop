const { check, body } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Review = require("../../models/reviewModel");

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("ratings value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("rating value must be between 1 to 5"),
  check("user").isMongoId().withMessage("Invalid Review Id format"),
  check("product")
    .isMongoId()
    .withMessage("Invalid Review Id format")
    .custom(async (val, { req }) => {
      // check if logged user create review before
      const review = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });
      if (review) {
        throw new Error("you already created a review before");
      }
      return review;
    }),
  validatorMiddleware,
];

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review Id format"),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review Id format")
    .custom(async (val, { req }) => {
      // check review ownership before update
      const review = await Review.findById(val);
      if (!review) {
        throw new Error(`there is no review with this id ${val}`);
      }
      if (review.user._id.toString() !== req.user._id.toString()) {
        throw new Error(`your are not allowed to perform this action`);
      }
      return review;
    }),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid Review id format")
    .custom(async (val, { req }) => {
      if (req.user.role === "user") {
        // check review ownership before update
        const review = await Review.findById(val);
        if (!review) {
          throw new Error(`there is no review with this id ${val}`);
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          throw new Error(`your are not allowed to perform this action`);
        }
        return review;
      }
      return true
    }),
  validatorMiddleware,
];
