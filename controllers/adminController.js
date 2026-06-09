const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const getDashboardStats = async (req, res, next) => {
  try {
    const totalSalesResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
    ]);
    const totalSales =
      totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const salesByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          orderStatus: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          sales: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          sales: 1,
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        salesByMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const bestSellingProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalSold: { $sum: '$orderItems.qty' },
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    const inventoryReports = await Product.find({ stock: { $lte: 10 } })
      .select('name sku stock price')
      .sort({ stock: 1 });

    res.status(200).json({
      success: true,
      data: {
        bestSellingProducts,
        lowStockItems: inventoryReports,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getReports,
};
