const mongoose = require("mongoose");

const brandSchema = mongoose.Schema({
  name: {
    type: String,
    required: [True, "Brand Name is required"],
  },
  description: String,
  imagePreview: String,
  imageURL: String,
  categories: [String],
  // products:[]
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
