class ApiFeatures {
  constructor(mongooseQuery, query) {
    this.mongooseQuery = mongooseQuery;
    this.query = query;
  }

  filter() {
    const queryingObj = { ...this.query };
    const excludesFields = ["page", "sort", "limit", "fields", "keyword"];
    excludesFields.forEach((field) => delete queryingObj[field]);
    // Apply filteration using [gte, gt, lte, lt]
    let query = JSON.stringify({ ...queryingObj });
    query = query.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(query));

    return this;
  }

  sort() {
    if (this.query.sort) {
      const sortBy = this.query.sort.split(",").join(" ");

      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitField() {
    if (this.query.fields) {
      const fields = this.query.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search(modelName) {
    const query = {};
    if (this.query.keyword) {
      if (modelName === "products") {
        query.$or = [
          {
            title: { $regex: new RegExp(this.query.keyword, "i") },
          },
          {
            description: { $regex: new RegExp(this.query.keyword, "i") },
          },
        ];
      } else {
        query.$or = [
          {
            name: { $regex: new RegExp(this.query.keyword, "i") },
          },
        ];
      }
      this.mongooseQuery = this.mongooseQuery.find(query);
    }

    return this;
  }

  paginate(countDocuments) {
    const page = this.query.page * 1 || 1;
    const limit = this.query.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit; // if currentPage = 2 & limit = 10 then endEndex = 20
    // pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.numberOfPage = Math.ceil(countDocuments / limit);
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }
    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
