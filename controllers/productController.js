const Product = require('../models/Product');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const path = require('path');

const sanitizeImagePath = (img) => {
  if (!img || typeof img !== 'string') return img;
  if (img.includes(':\\') || img.match(/^\/[A-Z]:/i)) {
    return `/uploads/${path.basename(img)}`;
  }
  return img;
};

const getImageUrl = (file) => file.path || `/uploads/${file.filename}`;

const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const queryObj = {};
    if (req.query.status !== '' && !req.query.status) {
      queryObj.status = 'active';
    } else if (req.query.status) {
      queryObj.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryObj.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
      ];
    }

    if (req.query.category) {
      const cats = req.query.category.split(',').map(c => c.trim()).filter(Boolean);
      if (cats.length > 1) {
        queryObj.category = { $in: cats.map(c => new RegExp(`^${c}$`, 'i')) };
      } else if (cats.length === 1) {
        queryObj.category = { $regex: new RegExp(`^${cats[0]}$`, 'i') };
      }
    }

    if (req.query.gender) {
      const genders = req.query.gender.split(',').map(g => g.trim()).filter(Boolean);
      queryObj.gender = genders.length > 1 ? { $in: genders } : genders[0];
    }

    if (req.query.brand) {
      const brands = req.query.brand.split(',').map(b => b.trim()).filter(Boolean);
      if (brands.length > 1) {
        queryObj.brand = { $in: brands.map(b => new RegExp(`^${b}$`, 'i')) };
      } else if (brands.length === 1) {
        queryObj.brand = { $regex: new RegExp(`^${brands[0]}$`, 'i') };
      }
    }

    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.size) {
      queryObj.sizes = req.query.size;
    }

    if (req.query.color) {
      const colors = req.query.color.split(',').map(c => c.trim()).filter(Boolean);
      if (colors.length > 1) {
        queryObj.color = { $in: colors.map(c => new RegExp(`^${c}$`, 'i')) };
      } else if (colors.length === 1) {
        queryObj.color = { $regex: new RegExp(`^${colors[0]}$`, 'i') };
      }
    }

    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price':
          sortOption = { price: 1 };
          break;
        case '-price':
          sortOption = { price: -1 };
          break;
        case 'rating':
        case '-rating':
          sortOption = { rating: -1 };
          break;
        case 'createdAt':
        case '-createdAt':
          sortOption = { createdAt: -1 };
          break;
        case 'name':
          sortOption = { name: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const total = await Product.countDocuments(queryObj);

    const products = await Product.find(queryObj)
      .sort(sortOption)
      .skip(startIndex)
      .limit(limit);

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const reviews = await Review.find({ product: req.params.id, status: 'approved' });

    res.status(200).json({
      success: true,
      data: product,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

const generateSku = (brand) => {
  const prefix = (brand || 'GEN').toUpperCase().slice(0, 4);
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${ts}${rand}`;
};

const createProduct = async (req, res, next) => {
  try {
    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map(getImageUrl);
    }

    const productData = {
      ...req.body,
      images,
    };

    if (productData.price) productData.price = Number(productData.price);
    if (productData.discountPrice)
      productData.discountPrice = Number(productData.discountPrice);
    if (productData.stock) productData.stock = Number(productData.stock);

    if (typeof productData.color === 'string') {
      productData.color = productData.color.split(',').map((c) => c.trim());
    }
    if (typeof productData.sizes === 'string') {
      productData.sizes = productData.sizes.split(',').map((s) => s.trim());
    }
    if (typeof productData.tags === 'string') {
      productData.tags = productData.tags.split(',').map((t) => t.trim());
    }

    if (productData.featured === 'true' || productData.featured === true) {
      productData.featured = true;
    } else if (
      productData.featured === 'false' ||
      productData.featured === false
    ) {
      productData.featured = false;
    }

    if (!productData.sku) {
      productData.sku = generateSku(productData.brand);
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyValue?.sku) {
      req.body.sku = '';
      return createProduct(req, res, next);
    }
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const existingImages = req.body.existingImages
      ? (Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages])
      : [];
    const hasNew = req.files && req.files.length > 0;
    if (hasNew || existingImages.length > 0) {
      const newImages = hasNew
        ? req.files.map(getImageUrl)
        : [];
      req.body.images = [...existingImages, ...newImages].map(sanitizeImagePath);
    }

    if (req.body.price) req.body.price = Number(req.body.price);
    if (req.body.discountPrice)
      req.body.discountPrice = Number(req.body.discountPrice);
    if (req.body.stock) req.body.stock = Number(req.body.stock);

    if (typeof req.body.color === 'string') {
      req.body.color = req.body.color.split(',').map((c) => c.trim());
    }
    if (typeof req.body.sizes === 'string') {
      req.body.sizes = req.body.sizes.split(',').map((s) => s.trim());
    }
    if (typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map((t) => t.trim());
    }

    if (!req.body.sku) {
      req.body.sku = generateSku(req.body.brand);
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Review.deleteMany({ product: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const createProductReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user.id,
      product: req.params.id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Product already reviewed',
      });
    }

    const review = await Review.create({
      user: req.user.id,
      product: req.params.id,
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    });

    const reviews = await Review.find({ product: req.params.id, status: 'approved' });

    if (reviews.length > 0) {
      const avgRating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      product.rating = Number(avgRating.toFixed(1));
      product.numReviews = reviews.length;
    } else {
      product.rating = 0;
      product.numReviews = 0;
    }

    await product.save();

    await Notification.create({
      type: 'new_review',
      title: 'New Product Review',
      message: `${req.user.name} reviewed "${product.name}" — ${req.body.rating}/5 stars`,
      link: `/product/${req.params.id}`,
      refId: review._id,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .sort({ rating: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true, status: 'active' });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getFeaturedProducts,
};
