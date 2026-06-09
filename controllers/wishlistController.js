const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      'items.product',
      'name price images stock'
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, items: [] });
    }

    const alreadyExists = wishlist.items.find(
      (item) => item.product.toString() === productId
    );

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    wishlist.items.push({
      product: productId,
      name: product.name,
      image: product.images[0] || '',
      price: product.discountPrice || product.price,
    });

    await wishlist.save();

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const moveToCart = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    const wishlistItem = wishlist.items.find(
      (item) => item.product.toString() === req.params.productId
    );

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist',
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const existingCartItem = cart.items.find(
      (item) => item.product.toString() === req.params.productId
    );

    if (existingCartItem) {
      existingCartItem.qty += 1;
    } else {
      cart.items.push({
        product: wishlistItem.product,
        name: wishlistItem.name,
        image: wishlistItem.image,
        price: wishlistItem.price,
        countInStock: 10,
        qty: 1,
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();
    await wishlist.save();

    res.status(200).json({
      success: true,
      wishlist: wishlist,
      cart: cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
};
