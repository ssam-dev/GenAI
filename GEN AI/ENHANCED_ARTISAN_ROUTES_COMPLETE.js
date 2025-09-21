// server/routes/artisans.js
// Complete Enhanced Artisan Routes
// Features: Advanced filtering, comprehensive CRUD operations

const express = require('express');
const router = express.Router();
const Artisan = require('../models/Artisan');
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * POST /api/artisans
 * Create new artisan registration
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      address,
      experience,
      // Traditional registration fields
      password,
      description,
      website,
      socialMedia,
      certifications,
      portfolio
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !specialization || !address) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'phone', 'specialization', 'address']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate phone format (basic validation for Indian numbers)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: 'Invalid phone number format'
      });
    }

    // Check if email already exists
    const existingArtisan = await Artisan.findOne({ email: email.toLowerCase() });
    if (existingArtisan) {
      return res.status(409).json({
        error: 'Email already registered',
        suggestion: 'Please use a different email address or try logging in'
      });
    }

    // Process experience field
    let experienceYears = parseInt(experience) || 1;

    // Categorize specialization
    const specializationCategories = {
      pottery: ['pottery', 'ceramic', 'clay', 'मिट्टी', 'माती'],
      jewelry: ['jewelry', 'jewellery', 'ornament', 'आभूषण', 'दागिने'],
      textile: ['textile', 'cloth', 'fabric', 'weaving', 'वस्त्र', 'कापड'],
      woodwork: ['wood', 'carpenter', 'furniture', 'लकड़ी', 'लाकूड'],
      metalwork: ['metal', 'iron', 'brass', 'copper', 'धातु', 'लोखंड'],
      painting: ['painting', 'art', 'canvas', 'चित्रकारी', 'चित्रकला'],
      sculpture: ['sculpture', 'carving', 'मूर्तिकला', 'शिल्प'],
      embroidery: ['embroidery', 'stitching', 'कढ़ाई', 'भरतकाम']
    };

    let category = 'other';
    const specializationLower = specialization.toLowerCase();
    
    for (const [cat, keywords] of Object.entries(specializationCategories)) {
      if (keywords.some(keyword => specializationLower.includes(keyword))) {
        category = cat;
        break;
      }
    }

    // Set default online presence
    let onlinePresence = false;

    // Create artisan document
    const artisanData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      specialization: specialization.trim(),
      category,
      address: address.trim(),
      experience: experienceYears,
      onlinePresence,
      status: 'pending', // All registrations start as pending for approval
      registrationDate: new Date(),
      
      // Traditional registration fields
      ...(description && { description: description.trim() }),
      ...(website && { website: website.trim() }),
      ...(socialMedia && { socialMedia }),
      ...(certifications && { certifications }),
      ...(portfolio && { portfolio })
    };

    const artisan = new Artisan(artisanData);
    await artisan.save();

    // If this is a traditional registration with password, create user account
    if (password) {
      try {
        const userData = {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          role: 'artisan',
          artisanId: artisan._id
        };
        
        const user = new User(userData);
        await user.save();
        
        artisan.userId = user._id;
        await artisan.save();
      } catch (userError) {
        // If user creation fails, still keep the artisan registration
        console.error('User creation failed:', userError);
      }
    }

    console.log('Artisan registration successful:', {
      id: artisan._id,
      name: artisan.name,
      email: artisan.email,
      category
    });

    // Return success response
    const response = {
      message: 'Artisan registration successful',
      artisan: {
        id: artisan._id,
        name: artisan.name,
        email: artisan.email,
        specialization: artisan.specialization,
        category: artisan.category,
        status: artisan.status,
        registrationDate: artisan.registrationDate
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Artisan registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'An artisan with this email already exists'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register artisan'
    });
  }
});

/**
 * GET /api/artisans
 * Get all artisans with advanced filtering
 */
router.get('/', async (req, res) => {
  try {
    const {
      state,
      city,
      category,
      specialty,
      experience,
      rating,
      verified,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (state) {
      filter['region.state'] = new RegExp(state, 'i');
    }
    
    if (city) {
      filter['region.city'] = new RegExp(city, 'i');
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (specialty) {
      filter.specialties = { $in: [new RegExp(specialty, 'i')] };
    }
    
    if (experience) {
      filter.experience = { $gte: parseInt(experience) };
    }
    
    if (rating) {
      filter['rating.average'] = { $gte: parseFloat(rating) };
    }
    
    if (verified !== undefined) {
      filter.isVerified = verified === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const artisans = await Artisan.find(filter)
      .populate('userId', 'name email profileImage')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Artisan.countDocuments(filter);

    // Format response
    const formattedArtisans = artisans.map(artisan => ({
      id: artisan._id,
      name: artisan.userId?.name || artisan.name,
      email: artisan.email,
      businessName: artisan.businessName,
      description: artisan.description,
      specialties: artisan.specialties,
      experience: artisan.experience,
      region: artisan.region,
      socialMedia: artisan.socialMedia,
      certifications: artisan.certifications,
      isVerified: artisan.isVerified,
      rating: artisan.rating,
      totalSales: artisan.totalSales,
      joinedAt: artisan.joinedAt,
      createdAt: artisan.createdAt
    }));

    res.json({
      success: true,
      data: {
        artisans: formattedArtisans,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        },
        filters: {
          state,
          city,
          category,
          specialty,
          experience,
          rating,
          verified
        }
      }
    });

  } catch (error) {
    console.error('Get artisans error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch artisans'
    });
  }
});

/**
 * GET /api/artisans/:id
 * Get single artisan by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id)
      .populate('userId', 'name email phone profileImage')
      .select('-__v');

    if (!artisan) {
      return res.status(404).json({
        error: 'Artisan not found'
      });
    }

    res.json({
      success: true,
      data: {
        artisan: {
          id: artisan._id,
          name: artisan.userId?.name || artisan.name,
          email: artisan.email,
          businessName: artisan.businessName,
          description: artisan.description,
          specialties: artisan.specialties,
          experience: artisan.experience,
          region: artisan.region,
          socialMedia: artisan.socialMedia,
          certifications: artisan.certifications,
          isVerified: artisan.isVerified,
          rating: artisan.rating,
          totalSales: artisan.totalSales,
          joinedAt: artisan.joinedAt,
          createdAt: artisan.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get artisan error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch artisan'
    });
  }
});

/**
 * PUT /api/artisans/:id
 * Update artisan profile
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);
    
    if (!artisan) {
      return res.status(404).json({
        error: 'Artisan not found'
      });
    }

    // Check if user owns this profile or is admin
    if (artisan.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only update your own profile'
      });
    }

    // Remove fields that shouldn't be updated directly
    const updates = { ...req.body };
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updatedArtisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Artisan profile updated successfully',
      data: {
        artisan: updatedArtisan
      }
    });

  } catch (error) {
    console.error('Update artisan error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update artisan profile'
    });
  }
});

/**
 * DELETE /api/artisans/:id
 * Delete artisan profile
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);
    
    if (!artisan) {
      return res.status(404).json({
        error: 'Artisan not found'
      });
    }

    // Check if user owns this profile or is admin
    if (artisan.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only delete your own profile'
      });
    }

    await Artisan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Artisan profile deleted successfully'
    });

  } catch (error) {
    console.error('Delete artisan error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete artisan profile'
    });
  }
});

/**
 * GET /api/artisans/stats/overview
 * Get artisan statistics overview
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Artisan.aggregate([
      {
        $group: {
          _id: null,
          totalArtisans: { $sum: 1 },
          verifiedArtisans: { $sum: { $cond: ['$isVerified', 1, 0] } },
          averageRating: { $avg: '$rating.average' },
          totalSales: { $sum: '$totalSales' },
          averageExperience: { $avg: '$experience' }
        }
      }
    ]);

    const categoryStats = await Artisan.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating.average' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalArtisans: 0,
          verifiedArtisans: 0,
          averageRating: 0,
          totalSales: 0,
          averageExperience: 0
        },
        categories: categoryStats
      }
    });

  } catch (error) {
    console.error('Get artisan stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch artisan statistics'
    });
  }
});

module.exports = router;
module.exports = router;