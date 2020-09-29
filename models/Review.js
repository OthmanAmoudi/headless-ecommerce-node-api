const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Review = mongoose.model("review", reviewSchema);
module.exports = Review;
