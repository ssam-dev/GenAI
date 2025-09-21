const express = require('express');
const router = express.Router();
const Artisan = require('../models/Artisan');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Voice registration endpoint
router.post('/', async (req, res) => {
  try {
    console.log('Voice registration request:', req.body);
    
    const { name, location, category, phone, language } = req.body;
    
    // Validate required fields
    if (!name || !location || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, location, and category are required' 
      });
    }

    // Generate user credentials
    const userEmail = `${name.replace(/\s+/g, '').toLowerCase()}_${Date.now()}@voiceassistant.temp`;
    const userPassword = `Voice${Date.now()}!`;
    const hashedPassword = await bcrypt.hash(userPassword, 12);
    
    // Create user account
    const user = new User({
      name: name.trim(),
      email: userEmail,
      password: hashedPassword,
      role: 'artisan',
      phone: phone || '',
      isVerified: false
    });
    
    await user.save();
    console.log('User created:', user._id);
    
    // Parse location
    const locationParts = location.split(',').map(part => part.trim());
    const city = locationParts[0] || location;
    const state = locationParts[1] || location;

    // Map category to specialty
    const specialtyMap = {
      'pottery': 'pottery',
      'textiles': 'textiles',
      'jewelry': 'jewelry',
      'painting': 'painting',
      'woodwork': 'woodwork',
      'metalwork': 'metalwork',
      'basketry': 'basketry',
      'leatherwork': 'leatherwork'
    };
    
    const specialty = specialtyMap[category.toLowerCase()] || 'textiles';
    
    // Create artisan profile
    const artisan = new Artisan({
      userId: user._id,
      businessName: `${name}'s ${category}`,
      description: `Artisan specializing in ${category} from ${location}. Registered via voice assistant.`,
      specialties: [specialty],
      experience: 1,
      region: {
        state: state,
        city: city,
        culturalBackground: `Traditional ${category} crafts from ${location}`
      },
      socialMedia: {},
      certifications: [],
      isVerified: false,
      rating: { average: 0, count: 0 },
      totalSales: 0,
      voiceRegistered: true,
      registrationLanguage: language || 'en-IN',
      joinedAt: new Date()
    });
    
    await artisan.save();
    console.log('Artisan created:', artisan._id);
    
    res.status(201).json({
      success: true,
      message: 'Artisan registered successfully via voice',
      data: { 
        artisanId: artisan._id, 
        userId: user._id, 
        name: user.name,
        email: user.email,
        location: location,
        category: category,
        voiceRegistered: true
      }
    });

  } catch (error) {
    console.error('Voice registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

module.exports = router;