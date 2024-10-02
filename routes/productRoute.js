const express = require("express");
const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  
  uploadProductImages,
  resizeProductImages,
} = require("../services/productService");
const reviewsRoute = require("./reviewRoute")
const authService = require("../services/authService");
const { uploadToFirebase, uploadMultipleImagesToFirebase, uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

const router = express.Router();
// POST     /product/fd54gj5unkyg5/reviews
// GET      /product/fd54gj5unkyg5/reviews
// GET      /product/fd54gj5unkyg5/reviews/d5ghtjhn5gj55jrn
router.use("/:productId/reviews", reviewsRoute);



router
  .route("/")
  .get(getProducts)
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadProductImages,
    // resizeProductImages,
    uploadMultipleImagesToFirebase,
    createProductValidator,
    createProduct
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
