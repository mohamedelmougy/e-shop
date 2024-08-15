const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const factory = require("./handlerFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const User = require("../models/userModel");
// upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

//image proccessing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // save image into our db
    req.body.profileImg = filename;
  }

  next();
});

// @desc     get list of users
// @route    GET /api/v1/users
// @access   private/Admin
exports.getUsers = factory.getAll(User);

// @desc     get specific user by id
// @route    POST /api/v1/users/:id
// @access   private/Admin
exports.getUser = factory.getOne(User);

// @desc     create specific user
// @route    PUT /api/v1/users/:id
// @access   private/Admin
exports.createUser = factory.createOne(User);

// @desc     update specific user
// @route    PUT /api/v1/users/:id
// @access   private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { name, phone, email, profileImg, role } = req.body;
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name,
      slug: slugify(req.body.name),
      phone,
      email,
      profileImg,
      role,
    },
    {
      new: true,
    }
  );
  if (!document) {
    next(new ApiError(`No document for this id: ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    next(new ApiError(`No document for this id: ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({ data: document });
});

// @desc     delete specific user
// @route    DELETE /api/v1/users/:id
// @access   private/Admin
exports.deleteUser = factory.deleteOne(User);

// @desc     get logged user data
// @route    POST /api/v1/users/get-me
// @access   private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc     get logged user password
// @route    POST /api/v1/users/update-my-password
// @access   private/protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1-update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  // 2-generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc     get logged user data (without password,role)
// @route    POST /api/v1/users/update-me
// @access   private/protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      email,
      phone,
    },
    { new: true }
  );
  res.status(200).json({ data: updatedUser });
});


// @desc     deactivate logged user
// @route    DELETE /api/v1/users/delete-me
// @access   private/protect
exports.deleteLoggedUserData = asyncHandler(async(req, res, next)=>{
    await User.findByIdAndUpdate(req.user._id,{active:false})

    res.status(204).json({status:"Success"})
})