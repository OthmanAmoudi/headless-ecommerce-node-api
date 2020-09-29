const mongoose = require("mongoose");
const shortid = require("shortid");
const slugify = require("slugify");

const brandSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: [True, "Brand Name is required"],
  },
  slug: String,
  description: String,
  logoImage: String,
  imageThumbnail: String,
  categories: [String],
});

brandSchema.pre("save", async function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Brand = mongoose.model("brand", brandSchema);

module.exports = Brand;
