const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../utils/apiError");
const bucket = require("../config/firebaseAdmin");

const multerOptions = () => {
  // 1-diskStorage engine
  // const multerStorage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     cb(null, "uploads/categories");
  //   },
  //   filename: function (req, file, cb) {
  //     // category-${id}.Date.now().jpeg
  //     const ext = file.mimetype.split("/")[1];
  //     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
  //     cb(null,filename)
  //   },
  // });

  // 2-memoryStorage engine
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);

exports.uploadToFirebase = async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("No file uploaded", 400));
  }

  const file = req.file;
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`; // Use the same filename logic as in resizeImage
  const blob = bucket.file(filename);

  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype
    }
  });

  blobStream.on('error', (err) => {
    next(new ApiError(`Error uploading file: ${err.message}`, 500));
  });

  blobStream.on('finish', async () => {
    await blob.makePublic(); 
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    req.body.image = publicUrl; // Attach the public URL to the request body
    next(); // Move to the next middleware or route handler
  });

  blobStream.end(file.buffer);
};






exports.uploadMultipleImagesToFirebase = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ApiError("No files uploaded", 400));
  }

  const fileUploadPromises = [];
  const uploadedImageUrls = []; // Flat array to store image URLs

  // Iterate over each file field (if multiple fields are used)
  for (const field in req.files) {
    req.files[field].forEach((file) => {
      const filename = `${field}-${uuidv4()}-${Date.now()}.jpeg`; // Generate unique filenames
      const blob = bucket.file(filename);

      // Create a promise for each upload and store it
      const uploadPromise = new Promise((resolve, reject) => {
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        blobStream.on('error', (err) => {
          reject(new ApiError(`Error uploading file: ${err.message}`, 500));
        });

        blobStream.on('finish', async () => {
          try {
            await blob.makePublic(); // Make the file public
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            
            uploadedImageUrls.push(publicUrl); // Push the public URL into the array
            resolve();
          } catch (err) {
            reject(new ApiError(`Error making file public: ${err.message}`, 500));
          }
        });

        // Pipe the file buffer to the blob stream
        blobStream.end(file.buffer);
      });

      fileUploadPromises.push(uploadPromise);
    });
  }

  // Wait for all uploads to finish
  try {
    await Promise.all(fileUploadPromises);
    req.body.images = uploadedImageUrls; // Attach the array of image URLs to the request body
    req.body.imageCover = uploadedImageUrls[0]
    next(); // Move to the next middleware or route handler
  } catch (error) {
    next(error);
  }
};  