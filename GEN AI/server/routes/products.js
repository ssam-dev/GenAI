const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['textiles', 'pottery', 'jewelry', 'painting', 'woodwork', 'metalwork', 'basketry', 'leatherwork']),
  query('state').optional().isString().trim(),
  query('search').optional().isString().trim(),
  query('sortBy').optional().isIn(['price', 'rating', 'createdAt', 'salesCount']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 12,
      category,
      state,
      artisan,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (state) {
      filter['culturalSignificance.regionOfOrigin.state'] = new RegExp(state, 'i');
    }
    
    if (artisan) {
      filter.artisan = artisan;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .populate('artisan', 'businessName region rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @route   GET /api/products/categories
// @desc    Get product categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// @route   GET /api/products/states
// @desc    Get states with product counts
// @access  Public
router.get('/states', async (req, res) => {
  try {
    const states = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$culturalSignificance.regionOfOrigin.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(states);
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({ message: 'Server error while fetching states' });
  }
});

// @route   GET /api/products/compare
// @desc    Compare products from different states
// @access  Public
router.get('/compare', [
  query('state1').isString().trim().notEmpty().withMessage('State1 is required'),
  query('state2').isString().trim().notEmpty().withMessage('State2 is required'),
  query('category').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { state1, state2, category } = req.query;

    const filter1 = {
      isActive: true,
      'culturalSignificance.regionOfOrigin.state': new RegExp(state1, 'i')
    };
    const filter2 = {
      isActive: true,
      'culturalSignificance.regionOfOrigin.state': new RegExp(state2, 'i')
    };

    if (category) {
      filter1.category = category;
      filter2.category = category;
    }

    const [products1, products2] = await Promise.all([
      Product.find(filter1)
        .populate('artisan', 'businessName region')
        .limit(5)
        .sort({ rating: -1 }),
      Product.find(filter2)
        .populate('artisan', 'businessName region')
        .limit(5)
        .sort({ rating: -1 })
    ]);

    res.json({
      state1: {
        name: state1,
        products: products1
      },
      state2: {
        name: state2,
        products: products2
      }
    });
  } catch (error) {
    console.error('Compare products error:', error);
    res.status(500).json({ message: 'Server error while comparing products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('artisan', 'businessName region description rating specialties');

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get related products from same artisan
    const relatedProducts = await Product.find({
      artisan: product.artisan._id,
      _id: { $ne: product._id },
      isActive: true
    }).limit(4).populate('artisan', 'businessName');

    res.json({
      product,
      relatedProducts
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Artisan)
router.post('/', auth, requireRole(['artisan', 'admin']), [
  body('name').trim().isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
  body('category').isIn(['textiles', 'pottery', 'jewelry', 'painting', 'woodwork', 'metalwork', 'basketry', 'leatherwork']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('culturalSignificance.history').trim().isLength({ min: 10 }).withMessage('Cultural history is required'),
  body('culturalSignificance.symbolism').trim().isLength({ min: 10 }).withMessage('Cultural symbolism is required'),
  body('culturalSignificance.regionOfOrigin.state').trim().notEmpty().withMessage('State of origin is required'),
  body('culturalSignificance.timeToCreate').trim().notEmpty().withMessage('Time to create is required'),
  body('inventory.quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
], async (req, res) => {
  try {
    console.log('Product creation request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Find artisan profile
    const artisan = await Artisan.findOne({ userId: req.user._id });
    if (!artisan) {
      return res.status(400).json({ message: 'Artisan profile not found' });
    }

    const productData = {
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      description: req.body.description,
      culturalSignificance: {
        history: req.body.culturalSignificance?.history,
        symbolism: req.body.culturalSignificance?.symbolism,
        regionOfOrigin: {
          state: req.body.culturalSignificance?.regionOfOrigin?.state,
          city: req.body.culturalSignificance?.regionOfOrigin?.city,
          culturalGroup: req.body.culturalSignificance?.regionOfOrigin?.culturalGroup
        },
        timeToCreate: req.body.culturalSignificance?.timeToCreate
      },
      inventory: {
        quantity: req.body.inventory?.quantity
      },
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      artisan: artisan._id
    };

    const product = new Product(productData);
    await product.save();

    await product.populate('artisan', 'businessName region');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => ({ msg: err.message }))
      });
    }
    res.status(500).json({ message: 'Server error while creating product', error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Artisan/Owner)
router.put('/:id', auth, requireRole(['artisan', 'admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product (for artisans)
    if (req.user.role === 'artisan') {
      const artisan = await Artisan.findOne({ userId: req.user._id });
      if (!artisan || product.artisan.toString() !== artisan._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this product' });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('artisan', 'businessName region');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Artisan/Owner)
router.delete('/:id', auth, requireRole(['artisan', 'admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product (for artisans)
    if (req.user.role === 'artisan') {
      const artisan = await Artisan.findOne({ userId: req.user._id });
      if (!artisan || product.artisan.toString() !== artisan._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this product' });
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

module.exports = router;
