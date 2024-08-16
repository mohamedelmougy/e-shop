const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
 
    const deletedDocument = await Model.findOneAndDelete({ _id: id });
 
    if (deletedDocument) {
      if (Model.modelName === 'review') {
        const productId = deletedDocument.product;
        // Recalculate average ratings and quantity for the product
        await Model.calcAverageRatingsAndQuantity(productId);
      }
 
      res.status(200).json({ item: `${deletedDocument._id} : successfully deleted` });
    } else {
      return next(new ApiError(`No Document for this id ${id}`, 404));
    }
  });

exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const document = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      next(new ApiError(`No document for this id: ${req.params.id}`, 404));
      return;
    }
    // Trigger "save" event when update document
    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const newDoc = await model.create(req.body);
    res.status(201).json({ data: newDoc });
  });

exports.getOne = (model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // 1-build query
    let query = model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }
    // 2-Execute query
    const docoment = await query;
    if (!docoment) {
      next(new ApiError(`No docoment for this id: ${id}`, 404));
      return;
    }
    res.status(200).json({ data: docoment });
  });

exports.getAll = (model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObject) filter = req.filterObject;

    // build query
    const DocumentsCounts = await model.countDocuments();
    const apiFeatures = new ApiFeatures(model.find(filter), req.query)
      .paginate(DocumentsCounts)
      .filter()
      .search(modelName)
      .limitField()
      .sort();
    //Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });
