const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      lowercase: true,
      required: [true, 'Product Title is not defined!']
    },
    description: {
      type: Map,
      of: String,
      required: [true, 'Product Description is not defined!']
    },
    imgUrls: {
      type: [String],
      required: [true, 'Product images are not defined!']
    },
    imgUrl: {
      type: String,
      required: [true, 'Product Image is not defined!']
    },

    currentPrice: {
      type: Number,
      required: [true, 'Product price is not defined!']
    },
    oldPrice: Number,
    avgRating: {
      type: Number,
      default: 0
    },
    ratingsCount: {
      type: Number,
      default: 0
    },
    sizes: [String],
    isInStock: {
      type: Boolean,
      default: true
    },
    tags: [String],
    category: String
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.index({ title: 'text' });

productSchema.virtual('off').get(function () {
  return Math.round(
    ((this.oldPrice - this.currentPrice) / this.oldPrice) * 100
  );
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
