const Product = require('../models/Product');

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { search, category, stockStatus } = req.query;

    // Build base filter
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    let products = await Product.find(filter).sort({ createdAt: -1 });

    // In-memory stockStatus filter (uses virtual which depends on each doc's lowStockThreshold)
    if (stockStatus) {
      products = products.filter((p) => p.stockStatus === stockStatus);
    }

    res.status(200).json({ count: products.length, products });
  } catch (error) {
    console.error('getAllProducts error:', error);
    res.status(500).json({ message: 'Error fetching products.', error: error.message });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json({ product });
  } catch (error) {
    console.error('getProduct error:', error);
    res.status(500).json({ message: 'Error fetching product.', error: error.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, quantity, sku, lowStockThreshold } = req.body;

    if (!name || !category || price === undefined || !sku) {
      return res.status(400).json({ message: 'name, category, price, and sku are required.' });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price,
      quantity: quantity !== undefined ? quantity : 0,
      sku,
      lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : 10,
    });

    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (error) {
    console.error('createProduct error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A product with this SKU already exists.' });
    }
    res.status(500).json({ message: 'Error creating product.', error: error.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const allowedFields = ['name', 'description', 'category', 'price', 'quantity', 'sku', 'lowStockThreshold'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (error) {
    console.error('updateProduct error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A product with this SKU already exists.' });
    }
    res.status(500).json({ message: 'Error updating product.', error: error.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json({ message: 'Product deleted successfully.', deletedId: req.params.id });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ message: 'Error deleting product.', error: error.message });
  }
};

module.exports = { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct };
