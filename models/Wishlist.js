const mongoose = require('mongoose');

const WishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const WishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [WishlistItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Wishlist', WishlistSchema);
