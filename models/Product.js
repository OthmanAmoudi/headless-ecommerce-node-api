const mongoose = require("mongoose");
const shortid = require("shortid");
const slugify = require("slugify");

const productSchema = mongoose.Schema({
  sku: String,
  name: {
    type: String,
    required: [true, "Product Name Can not Be Empty"],
    trim: true,
  },
  slug: {
    type: String,
    unqiue: true,
  },
  price: {
    type: Number,
    required: [true, "Product Price Can not Be Empty"],
  },
  description: {
    type: String,
    trim: true,
  },
  summary: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    default: "uncategorized",
  },
  onSale: {
    type: Boolean,
    default: false,
  },
  onSalePrice: Number,
  quantity: Number,
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  image: String,
  previewImage: String,
  assets: [String],
  shipping: {
    name: String,
    dimensions: {
      height: String,
      length: String,
      width: String,
    },
    weight: String,
  },
  //   tags:{['sss','dd','fff']}
  //   brand:{}
  // attributes
  //variantes
  //category
  cratedAt: {
    type: Date,
    default: Date.now(),
  },
});

productSchema.pre("save", async function (next) {
  let newSlug = slugify(this.name, { lower: true });
  const product = await Product.findOne({ slug: newSlug });
  if (product && product.slug === newSlug) {
    newSlug += `-${shortid.generate()}`;
  }
  this.slug = newSlug;
  next();
});
const Product = mongoose.model("product", productSchema);

module.exports = Product;
