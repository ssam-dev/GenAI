const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  specialties: [{
    type: String,
    enum: ['textiles', 'pottery', 'jewelry', 'painting', 'woodwork', 'metalwork', 'basketry', 'leatherwork']
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  region: {
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    culturalBackground: {
      type: String,
      required: true
    }
  },
  socialMedia: {
    website: String,
    instagram: String,
    facebook: String
  },
  certifications: [{
    name: String,
    issuingOrganization: String,
    dateIssued: Date
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalSales: {
    type: Number,
    default: 0
  },
  voiceRegistered: {
    type: Boolean,
    default: false
  },
  registrationLanguage: {
    type: String,
    default: 'en-IN'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Artisan', artisanSchema);
