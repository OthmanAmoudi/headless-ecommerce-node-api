const mongoose = require("mongoose");
const shortid = require("shortid");
const slugify = require("slugify");

const productSchema = mongoose.Schema({
  sku: String,
  name: {
    type: String,
    required: [true, "Product Name Can not Be Empty"],
  },
  slug: {
    type: String,
    unqiue: true,
  },
  price: {
    type: Number,
    required: [true, "Product Price Can not Be Empty"],
  },
  description: String,
  summary: String,
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
  image: String,
  previewImage: String,
  assets: [
    {
      url: String,
      height: String,
      width: String,
    },
  ],
  shipping: {
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
