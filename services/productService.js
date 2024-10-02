const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const {uploadMixOfImages} = require("../middlewares/uploadImageMiddleware")
const factory = require("./handlerFactory");
const Product = require("../models/productModel");





exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: "5",
  },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  const imageCoverfilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
  //1- Image processing for imageCover
  if (req.files.imageCover) {
    await sharp(req.files.imageCover[0].buffer)
      .resize(1200, 1333)
      .toFormat("jpeg")
      // .jpeg({ quality: 95 })
      // .toFile(`uploads/products/${imageCoverfilename}`);

    // save image into our db
    req.body.imageCover = imageCoverfilename;
  }
next()
  // 2- Image processing for images
  // if (req.files.images) {
  //   req.body.images = [];

  //   await Promise.all(
  //     req.files.images.map(async (img, index) => {
  //       const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

  //       await sharp(img.buffer)
  //         .resize(1200, 1333)
  //         .toFormat("jpeg")
  //         .jpeg({ quality: 95 })
  //         // .toFile(`uploads/products/${imageName}`);

  //       // save image into our db
  //       req.body.images.push(imageName);
  //     })
  //   );

  // }
  // next();
});

// @desc     get list of products
// @route    GET /api/v1/products
// @access   Public
exports.getProducts = factory.getAll(Product, "products");

// @desc     get specific product by id
// @route    POST /api/v1/products/:id
// @access   public
exports.getProduct = factory.getOne(Product,"reviews");

// @desc     create product
// @route    POST /api/v1/products
// @access   Private
exports.createProduct = factory.createOne(Product);

// @desc     update specific product
// @route    PUT /api/v1/products/:id
// @access   private
exports.updateProduct = factory.updateOne(Product);

// @desc     delete specific product
// @route    DELETE /api/v1/products/:id
// @access   private
exports.deleteProduct = factory.deleteOne(Product);
