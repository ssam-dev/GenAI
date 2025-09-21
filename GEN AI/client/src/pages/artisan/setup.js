import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/context';
import { artisansAPI } from '../../lib/api';
import { 
  Store, 
  MapPin, 
  Award, 
  Palette,
  Upload,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const ArtisanSetupPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    specialties: [],
    experience: '',
    region: {
      state: '',
      city: '',
      culturalBackground: ''
    },
    socialMedia: {
      website: '',
      instagram: '',
      facebook: ''
    }
  });

  const specialties = [
    'textiles', 'pottery', 'jewelry', 'painting', 
    'woodwork', 'metalwork', 'basketry', 'leatherwork'
  ];

  const states = [
    'Rajasthan', 'Gujarat', 'Odisha', 'Karnataka', 
    'Tamil Nadu', 'West Bengal', 'Maharashtra', 'Kerala',
    'Punjab', 'Himachal Pradesh', 'Uttar Pradesh', 'Madhya Pradesh'
  ];

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation
    if (!formData.businessName || formData.businessName.trim().length < 2) {
      toast.error('Business name must be at least 2 characters');
      return;
    }

    if (!formData.description || formData.description.trim().length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }
    
    if (formData.specialties.length === 0) {
      toast.error('Please select at least one specialty');
      return;
    }

    if (formData.experience === '' || isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
      toast.error('Please provide a valid years of experience (0 or more)');
      return;
    }

    if (!formData.region.state || !formData.region.city || !formData.region.culturalBackground) {
      toast.error('Please fill in all location details (state, city, and cultural background)');
      return;
    }

    try {
      setLoading(true);
      const res = await artisansAPI.createArtisanProfile({
        ...formData,
        experience: Number(formData.experience)
      });
      toast.success('Artisan profile created successfully!');
      const artisanId = res?.data?.artisan?._id;
      if (artisanId) {
        router.push(`/artisans/${artisanId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error creating artisan profile:', error);
      
      // Show specific error messages based on the error type
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const firstError = error.response.data.errors[0];
        toast.error(firstError.msg || 'Validation error');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if the server is running.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 400) {
        toast.error('Invalid data provided. Please check your inputs.');
      } else {
        toast.error('Error creating artisan profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.businessName || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (currentStep === 2) {
      if (formData.specialties.length === 0) {
        toast.error('Please select at least one specialty');
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.region.state || !formData.region.city || !formData.region.culturalBackground) {
        toast.error('Please fill in all location details');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  if (user?.role !== 'artisan') {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ArtisanCraft</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Artisan Profile</h1>
          <p className="text-gray-600">Help customers discover your unique crafts and cultural heritage</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 ml-4 ${
                    step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-16">
            <span className={`text-sm ${currentStep >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
              Basic Info
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
              Specialties
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
              Location
            </span>
            <span className={`text-sm ${currentStep >= 4 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
              Review
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  className="input-field"
                  placeholder="Enter your business or studio name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Tell us about your craft, techniques, and what makes your work unique..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  className="input-field"
                  placeholder="How many years have you been practicing your craft?"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Step 2: Specialties */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Specialties</h2>
              <p className="text-gray-600 mb-6">Select the types of crafts you specialize in (choose at least one)</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specialties.map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => handleSpecialtyToggle(specialty)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      formData.specialties.includes(specialty)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Palette className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium capitalize">{specialty}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Location & Cultural Background</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.region.state}
                    onChange={(e) => handleChange('region.state', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.region.city}
                    onChange={(e) => handleChange('region.city', e.target.value)}
                    className="input-field"
                    placeholder="Enter your city"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cultural Background *
                </label>
                <textarea
                  value={formData.region.culturalBackground}
                  onChange={(e) => handleChange('region.culturalBackground', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Tell us about your cultural heritage and traditional techniques..."
                  required
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Social Media (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.socialMedia.website}
                      onChange={(e) => handleChange('socialMedia.website', e.target.value)}
                      className="input-field"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleChange('socialMedia.instagram', e.target.value)}
                      className="input-field"
                      placeholder="@yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleChange('socialMedia.facebook', e.target.value)}
                      className="input-field"
                      placeholder="Your Facebook page"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Profile</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Business Name</h3>
                  <p className="text-gray-600">{formData.businessName}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <p className="text-gray-600">{formData.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Specialties</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.specialties.map((specialty) => (
                      <span key={specialty} className="px-2 py-1 bg-primary-100 text-primary-600 text-sm rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Location</h3>
                  <p className="text-gray-600">{formData.region.city}, {formData.region.state}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Cultural Background</h3>
                  <p className="text-gray-600">{formData.region.culturalBackground}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtisanSetupPage;
