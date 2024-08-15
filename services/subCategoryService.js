const SubCategory = require("../models/subCategoryModel");
const factory = require("./handlerFactory");

exports.setCategoryIdForBody = (req, res, next) => {
  // Nested route (create)
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// Nested route
// GET /api/v1/categories/:categoryId/subcategory
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

// @desc     get list of subcategories
// @route    GET /api/v1/subcategories
// @access   Public
exports.getSubCategories = factory.getAll(SubCategory);

// @desc     get specific subsategory by id
// @route    POST /api/v1/subsategory/:id
// @access   public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc     create subcategory
// @route    POST /api/v1/subcategories
// @access   Private
exports.createSubCategory = factory.createOne(SubCategory);

// @desc     update specific subcategory
// @route    PUT /api/v1/subcategory/:id
// @access   private
exports.updateSubCategoty = factory.updateOne(SubCategory);

// @desc     delete specific subcategory
// @route    DELETE /api/v1/subcategory/:id
// @access   private
exports.deleteSubCategory = factory.deleteOne(SubCategory);
