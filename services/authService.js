const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken")
const User = require("../models/userModel");



// @desc     signup
// @route    GET /api/v1/signup
// @access   public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1-create user
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
  });
  // 2-Generate token
  const token = createToken(user._id);

  res.status(201).json({ data: user, token });
});

// @desc     login
// @route    GET /api/v1/login
// @access   public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // 1-check if password and email in the body (validation)
  // 2-check id user exist & check if password is correct
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  // 3-generate token
  const token = createToken(user._id);
  // 4-send response to client side
  res.status(200).json({ data: user, token });
});

// @desc     make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1-check if token exist, if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login please login to get access this route",
        401
      )
    );
  }
  // 2-verify token (no change happens,expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3-check if user exist
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "the user that belong to this token does no longer exist",
        401
      )
    );
  }
  // 4-check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // password changed after token created (Error)
    if (passChangedTimeStamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently change his password, please login again",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

// @desc Authorization (user Permissions)
//              ["admin, "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1-access roles
    // 2-access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you are not allowed to access this route", 403)
      );
    }
    next();
  });

// @desc     forget password
// @route    POST /api/v1/forget-password
// @access   public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  // 1-get user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(`there is no user for this email: ${email}`, 404));
  }
  // 2-if user exist, generate 6 digits random and hash it and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // save hashed password reset code into db
  user.passwordResetCode = hashResetCode;
  // add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();
  // 3-send the reset via code
  const message = `Hi ${user.name},\n we received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n thanks for helping us keep your account secure. \n the E-shop team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset (valid for 10 min)",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});


// @desc     verify password reset code
// @route    POST /api/v1/verify-reset-code 
// @access   public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  // 1-get user based on reset code
  const user = await User.findOne({
    passwordResetCode: hashResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"))
  }
  // 2-Reset code valid
  user.passwordResetVerified = true
  await user.save()

  res.status(200).json({status:"Success"})
});


// @desc     reset password
// @route    POST /api/v1/reset-password 
// @access   public
exports.resetPassword = asyncHandler(async (req,res,next)=>{
  // 1-get user based on email
  const {email} = req.body
  const user = await User.findOne({email})
  if (!user) {
   return next(new ApiError(`there is no user for this email: ${email}`,404))
  }
  // 2-check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("reset code not verified",400))
  }

  user.password = req.body.newPassword

  user.passwordResetCode= undefined
  user.passwordResetExpires= undefined
  user.passwordResetVerified= undefined
  
  await user.save()

  // 3-if everything is ok,generate token
  const token = createToken(user._id)
  res.status(200).json({token})
})