const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand required"],
      unique: [true, "Brand must be unique"],
      minlength: [2, "Too short Brand name"],
      maxlength: [23, "Too long Brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

// const imageUrlPerfix =(type)=>{
//   brandSchema.post(type,  (doc)=> {
//     // return set image base url + image name
//     if (doc.image) {
//       const imageURL = `${process.env.BASE_URL}/categories/${doc.image}`;
//       doc.image = imageURL
//     }
//   });
// }

// findOne, findAll and update
// imageUrlPerfix("init")

// create
// imageUrlPerfix("save")




const brandModel = mongoose.model("Brand", brandSchema);

module.exports = brandModel;
