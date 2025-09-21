const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['textiles', 'pottery', 'jewelry', 'painting', 'woodwork', 'metalwork', 'basketry', 'leatherwork']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  culturalSignificance: {
    history: {
      type: String,
      required: true,
      maxlength: 1000
    },
    symbolism: {
      type: String,
      required: true,
      maxlength: 1000
    },
    regionOfOrigin: {
      state: {
        type: String,
        required: true
      },
      city: String,
      culturalGroup: String
    },
    traditionalTechniques: [String],
    materials: [String],
    timeToCreate: {
      type: String,
      required: true
    }
  },
  specifications: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inches'],
        default: 'cm'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['g', 'kg', 'lbs', 'oz'],
        default: 'g'
      }
    },
    careInstructions: String
  },
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    sku: String
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
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
  salesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, 'culturalSignificance.regionOfOrigin.state': 1 });
productSchema.index({ artisan: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
