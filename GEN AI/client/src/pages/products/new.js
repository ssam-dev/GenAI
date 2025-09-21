import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../lib/context';
import { productsAPI, artisansAPI } from '../../lib/api';
import { 
  ArrowLeft,
  Package,
  DollarSign,
  FileText,
  Upload,
  X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const NewProductPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    images: [],
    culturalSignificance: {
      history: '',
      symbolism: '',
      regionOfOrigin: {
        state: '',
        city: '',
        culturalGroup: ''
      },
      timeToCreate: ''
    },
    inventory: {
      quantity: ''
    },
    isActive: true
  });

  const categories = [
    'textiles', 'pottery', 'jewelry', 'painting', 
    'woodwork', 'metalwork', 'basketry', 'leatherwork'
  ];

  const states = [
    'Rajasthan', 'Gujarat', 'Odisha', 'Karnataka', 
    'Tamil Nadu', 'West Bengal', 'Maharashtra', 'Kerala',
    'Punjab', 'Himachal Pradesh', 'Uttar Pradesh', 'Madhya Pradesh'
  ];

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'artisan') {
      router.push('/');
      return;
    }

    fetchArtisanProfile();
  }, [isAuthenticated, isLoading, user, router]);

  const fetchArtisanProfile = async () => {
    try {
      const response = await artisansAPI.getMyArtisan();
      setArtisan(response.data.artisan);
    } catch (error) {
      console.error('Error fetching artisan profile:', error);
      toast.error('Please complete your artisan profile first');
      router.push('/artisan/setup');
    }
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child, subchild] = field.split('.');
      if (subchild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subchild]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select only image files');
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            file: file,
            preview: e.target.result,
            name: file.name
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!artisan) {
      toast.error('Please complete your artisan profile first');
      return;
    }

    // Validation
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Product name must be at least 2 characters');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    if (!formData.culturalSignificance.history || formData.culturalSignificance.history.trim().length < 10) {
      toast.error('Historical background must be at least 10 characters');
      return;
    }

    if (!formData.culturalSignificance.symbolism || formData.culturalSignificance.symbolism.trim().length < 10) {
      toast.error('Cultural symbolism must be at least 10 characters');
      return;
    }

    if (!formData.culturalSignificance.regionOfOrigin.state || !formData.culturalSignificance.regionOfOrigin.city || !formData.culturalSignificance.regionOfOrigin.culturalGroup) {
      toast.error('Please fill in all location details');
      return;
    }

    if (!formData.culturalSignificance.timeToCreate || formData.culturalSignificance.timeToCreate.trim().length < 3) {
      toast.error('Please specify time to create (e.g., 2 weeks, 3 days)');
      return;
    }

    if (!formData.inventory.quantity) {
      toast.error('Please specify quantity available');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare product data
      const productData = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        description: formData.description,
        culturalSignificance: {
          history: formData.culturalSignificance.history,
          symbolism: formData.culturalSignificance.symbolism,
          regionOfOrigin: {
            state: formData.culturalSignificance.regionOfOrigin.state,
            city: formData.culturalSignificance.regionOfOrigin.city,
            culturalGroup: formData.culturalSignificance.regionOfOrigin.culturalGroup
          },
          timeToCreate: formData.culturalSignificance.timeToCreate
        },
        inventory: {
          quantity: Number(formData.inventory.quantity)
        },
        isActive: formData.isActive
      };

      // Use the existing API method instead of fetch
      await productsAPI.createProduct(productData);
      toast.success('Product created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating product:', error);
      
      // Handle different types of errors
      if (error.message) {
        toast.error(error.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const firstError = error.response.data.errors[0];
        toast.error(firstError.msg || 'Validation error');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check if the server is running.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 400) {
        toast.error('Invalid data provided. Please check your inputs.');
      } else {
        toast.error('Error creating product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!artisan) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Artisan Profile Required</h2>
            <p className="text-gray-600 mb-6">Please complete your artisan profile first.</p>
            <Link href="/artisan/setup" className="btn-primary">Complete Profile</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600">Create a listing for your handmade craft</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input-field"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (INR) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="input-field pl-10"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
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
                  placeholder="Describe your product, its unique features, and craftsmanship..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Photos
                </label>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload photos or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB each
                      </p>
                    </label>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {image.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cultural Significance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Cultural Significance
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Historical Background *
                </label>
                <textarea
                  value={formData.culturalSignificance.history}
                  onChange={(e) => handleChange('culturalSignificance.history', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Share the historical significance and origin of this craft..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cultural Symbolism *
                </label>
                <textarea
                  value={formData.culturalSignificance.symbolism}
                  onChange={(e) => handleChange('culturalSignificance.symbolism', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Explain the cultural meaning and symbolism..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.culturalSignificance.regionOfOrigin.state}
                    onChange={(e) => handleChange('culturalSignificance.regionOfOrigin.state', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
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
                    value={formData.culturalSignificance.regionOfOrigin.city}
                    onChange={(e) => handleChange('culturalSignificance.regionOfOrigin.city', e.target.value)}
                    className="input-field"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cultural Group *
                  </label>
                  <input
                    type="text"
                    value={formData.culturalSignificance.regionOfOrigin.culturalGroup}
                    onChange={(e) => handleChange('culturalSignificance.regionOfOrigin.culturalGroup', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Rajasthani, Bengali"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time to Create *
                </label>
                <input
                  type="text"
                  value={formData.culturalSignificance.timeToCreate}
                  onChange={(e) => handleChange('culturalSignificance.timeToCreate', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 2 weeks, 3 days"
                  required
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Inventory
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Available *
              </label>
              <input
                type="number"
                value={formData.inventory.quantity}
                onChange={(e) => handleChange('inventory.quantity', e.target.value)}
                className="input-field"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard" className="btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewProductPage;