
const factory = require("./handlerFactory");
const Coupon = require("../models/couponModel");






// @desc     get list of coupons
// @route    GET /api/v1/coupons
// @access   private/Admin-Manager
exports.getCoupons = factory.getAll(Coupon);

// @desc     get specific Coupon by id
// @route    POST /api/v1/coupons/:id
// @access   private/Admin-Manager
exports.getCoupon = factory.getOne(Coupon);

// @desc     create specific coupon
// @route    PUT /api/v1/coupons
// @access   private/Admin-Manager
exports.createCoupon = factory.createOne(Coupon);

// @desc     update specific coupon
// @route    PUT /api/v1/coupons/:id
// @access   private/Admin-Manager
exports.updateCoupon = factory.updateOne(Coupon);

// @desc     delete specific coupons
// @route    DELETE /api/v1/coupons/:id
// @access   private/Admin-Manager
exports.deleteCoupon = factory.deleteOne(Coupon);
