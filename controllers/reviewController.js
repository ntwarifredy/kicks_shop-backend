const Review = require('../models/Review');
const Product = require('../models/Product');

const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      status: 'approved',
    }).populate('user', 'name');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const reviews = await Review.find({
      product: review.product,
      status: 'approved',
    });

    const product = await Product.findById(review.product);
    if (product) {
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
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const updateReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after', runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const reviews = await Review.find({
      product: review.product,
      status: 'approved',
    });

    const product = await Product.findById(review.product);
    if (product) {
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
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  deleteReview,
  updateReviewStatus,
};
