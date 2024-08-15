const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category required"],
      unique: [true, "category must be unique"],
      minlength: [3, "Too short category name"],
      maxlength: [23, "Too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const imageUrlPerfix =(type)=>{
  categorySchema.post(type,  (doc)=> {
    // return set image base url + image name
    if (doc.image) {
      const imageURL = `${process.env.BASE_URL}/categories/${doc.image}`;
      doc.image = imageURL
    }
  });
}

// findOne, findAll and update
imageUrlPerfix("init")

// create
imageUrlPerfix("save")



const CategoryModel = mongoose.model("category", categorySchema);

module.exports = CategoryModel;
