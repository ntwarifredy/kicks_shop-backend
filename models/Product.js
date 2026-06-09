const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [120, 'Product name cannot be more than 120 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Please add a brand'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be positive'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price must be positive'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock must be non-negative'],
    },
    images: [
      {
        type: String,
      },
    ],
    sku: {
      type: String,
      unique: true,
      required: [true, 'Please add a SKU'],
    },
    color: [
      {
        type: String,
      },
    ],
    sizes: [
      {
        type: String,
      },
    ],
    gender: {
      type: String,
      enum: ['men', 'women', 'kids', 'unisex'],
      default: 'unisex',
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'draft'],
      default: 'active',
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', ProductSchema);
