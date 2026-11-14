const Product = require('../models/Product');

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const [
      totalProducts,
      aggregateResult,
      lowStockProducts,
      outOfStockProducts,
      recentProducts,
    ] = await Promise.all([
      // Total product count
      Product.countDocuments(),

      // Aggregate: totalQuantity and totalValue
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
            totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          },
        },
      ]),

      // Low stock: quantity > 0 AND quantity <= lowStockThreshold
      Product.countDocuments({
        $expr: {
          $and: [
            { $gt: ['$quantity', 0] },
            { $lte: ['$quantity', '$lowStockThreshold'] },
          ],
        },
      }),

      // Out of stock: quantity === 0
      Product.countDocuments({ quantity: 0 }),

      // Recent 5 products
      Product.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const agg = aggregateResult[0] || { totalQuantity: 0, totalValue: 0 };

    const payload = {
      totalProducts,
      totalQuantity: agg.totalQuantity,
      totalValue: parseFloat(agg.totalValue.toFixed(2)),
      lowStockCount: lowStockProducts,
      outOfStockCount: outOfStockProducts,
      recentProducts,
    };

    res.status(200).json({
      stats: payload,
      ...payload,
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats.', error: error.message });
  }
};

module.exports = { getStats };
