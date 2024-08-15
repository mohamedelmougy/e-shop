const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const factory = require("./handlerFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const Category = require("../models/categoryModel");

// upload single image
exports.uploadCategoryImage = uploadSingleImage("image");

//image proccessing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/categories/${filename}`);

    // save image into our db
    req.body.image = filename;
  }

  next();
});

// @desc     get list of categories
// @route    GET /api/v1/categories
// @access   Public
exports.getCategories = factory.getAll(Category);

// @desc     get specific category by id
// @route    POST /api/v1/categories/:id
// @access   public
exports.getCategory = factory.getOne(Category);

// @desc     create category
// @route    POST /api/v1/categories
// @access   Private/Admin-Manager
exports.createCategory = factory.createOne(Category);

// @desc     update specific category
// @route    PUT /api/v1/categories/:id
// @access   private/Admin-Manager
exports.updateCategory = factory.updateOne(Category);

// @desc     delete specific category
// @route    DELETE /api/v1/categories/:id
// @access   private/Admin
exports.deleteCategory = factory.deleteOne(Category);
