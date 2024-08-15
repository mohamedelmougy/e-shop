const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const factory = require("./handlerFactory");
const {uploadSingleImage} =require("../middlewares/uploadImageMiddleware")
const Brand = require("../models/brandModel");


// upload single image
exports.uploadBrandImage = uploadSingleImage("image")

//image proccessing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/brands/${filename}`);

    // save image into our db
    req.body.image =filename

  next();
});



// @desc     get list of brands
// @route    GET /api/v1/brands
// @access   Public
exports.getBrands = factory.getAll(Brand);

// @desc     get specific brand by id
// @route    POST /api/v1/brand/:id
// @access   public
exports.getBrand = factory.getOne(Brand);

// @desc     create specific brand
// @route    PUT /api/v1/brands
// @access   private
exports.createBrand = factory.createOne(Brand);

// @desc     update specific brand
// @route    PUT /api/v1/brand/:id
// @access   private
exports.updateBrand = factory.updateOne(Brand);

// @desc     delete specific brand
// @route    DELETE /api/v1/brand/:id
// @access   private
exports.deleteBrand = factory.deleteOne(Brand);
