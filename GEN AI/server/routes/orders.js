const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, [
  body('shippingAddress.name').trim().notEmpty().withMessage('Shipping name is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Shipping street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('Shipping state is required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('Shipping zip code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Shipping country is required'),
  body('paymentMethod.type').isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer']).withMessage('Invalid payment method'),
  body('billingAddress').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate all items are still available
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || !product.isActive) {
        return res.status(400).json({ 
          message: `Product "${item.product.name}" is no longer available` 
        });
      }
      if (product.inventory.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Only ${product.inventory.quantity} items available for "${item.product.name}"` 
        });
      }
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtTime: item.priceAtTime,
      artisan: item.product.artisan
    }));

    // Calculate totals
    const subtotal = cart.totalAmount;
    const shippingCost = 0; // Free shipping for now
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress || req.body.shippingAddress,
      paymentMethod: {
        type: req.body.paymentMethod.type,
        transactionId: req.body.paymentMethod.transactionId || '',
        status: 'pending'
      },
      subtotal,
      shippingCost,
      tax,
      total,
      notes: req.body.notes || ''
    });

    await order.save();

    // Update product inventory and sales count
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          'inventory.quantity': -item.quantity,
          salesCount: item.quantity
        }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate order with product details
    await order.populate('items.product', 'name images culturalSignificance.regionOfOrigin');
    await order.populate('items.artisan', 'businessName');

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('items.product', 'name images culturalSignificance.regionOfOrigin')
      .populate('items.artisan', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('items.product', 'name images culturalSignificance.regionOfOrigin')
      .populate('items.artisan', 'businessName region');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin or Artisan)
router.put('/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('trackingNumber').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can update this order
    const canUpdate = req.user.role === 'admin' || 
      (req.user.role === 'artisan' && order.items.some(item => 
        item.artisan.toString() === req.user._id.toString()
      ));

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const updateData = { status };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('items.product', 'name images culturalSignificance.regionOfOrigin')
      .populate('items.artisan', 'businessName');

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error while updating order status' });
  }
});

// @route   GET /api/orders/artisan/:artisanId
// @desc    Get orders for specific artisan
// @access  Private (Artisan)
router.get('/artisan/:artisanId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'artisan' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view artisan orders' });
    }

    const { page = 1, limit = 10, status } = req.query;

    const filter = { 'items.artisan': req.params.artisanId };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name images culturalSignificance.regionOfOrigin')
      .populate('items.artisan', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get artisan orders error:', error);
    res.status(500).json({ message: 'Server error while fetching artisan orders' });
  }
});

module.exports = router;
