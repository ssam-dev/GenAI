import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { productsAPI } from '../lib/api';
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  ShoppingCart,
  ChevronDown,
  X,
  Award,
  Clock,
  Palette
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ComparePage = () => {
  const [state1, setState1] = useState('');
  const [state2, setState2] = useState('');
  const [category, setCategory] = useState('');
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStates();
    fetchCategories();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await productsAPI.getStates();
      setStates(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCompare = async () => {
    if (!state1 || !state2) {
      toast.error('Please select both states to compare');
      return;
    }

    if (state1 === state2) {
      toast.error('Please select different states for comparison');
      return;
    }

    setLoading(true);
    try {
      const response = await productsAPI.compareProducts(state1, state2, category);
      setComparisonData(response.data);
    } catch (error) {
      console.error('Error comparing products:', error);
      toast.error('Error fetching comparison data');
    } finally {
      setLoading(false);
    }
  };

  const swapStates = () => {
    const temp = state1;
    setState1(state2);
    setState2(temp);
  };

  const getStateStats = (products) => {
    if (!products || products.length === 0) return null;
    
    const prices = products.map(p => p.price);
    const ratings = products.map(p => p.rating?.average || 0);
    
    return {
      count: products.length,
      avgPrice: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgRating: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1),
      categories: [...new Set(products.map(p => p.category))],
    };
  };

  const stats1 = comparisonData ? getStateStats(comparisonData.state1.products) : null;
  const stats2 = comparisonData ? getStateStats(comparisonData.state2.products) : null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Compare Products by State
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the unique characteristics, cultural significance, and craftsmanship 
            differences between products from different states.
          </p>
        </div>

        {/* Comparison Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* State 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First State
              </label>
              <select
                value={state1}
                onChange={(e) => setState1(e.target.value)}
                className="input-field"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state._id} ({state.count} products)
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex items-end">
              <button
                onClick={swapStates}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={!state1 || !state2}
              >
                <ChevronDown className="w-5 h-5 mx-auto transform rotate-90" />
              </button>
            </div>

            {/* State 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Second State
              </label>
              <select
                value={state2}
                onChange={(e) => setState2(e.target.value)}
                className="input-field"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state._id} ({state.count} products)
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (Optional)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat._id.charAt(0).toUpperCase() + cat._id.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleCompare}
              disabled={loading || !state1 || !state2}
              className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Comparing...' : 'Compare States'}
            </button>
          </div>
        </div>

        {/* Comparison Results */}
        {comparisonData && (
          <div className="space-y-12">
            {/* State Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* State 1 Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {comparisonData.state1.name}
                  </h3>
                  <div className="flex items-center text-primary-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="font-medium">{stats1?.count || 0} products</span>
                  </div>
                </div>

                {stats1 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">${stats1.avgPrice}</div>
                      <div className="text-sm text-gray-600">Average Price</div>
                    </div>
                    <div className="text-center p-4 bg-accent-50 rounded-lg">
                      <div className="text-2xl font-bold text-accent-600">{stats1.avgRating}</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="text-center p-4 bg-secondary-50 rounded-lg">
                      <div className="text-2xl font-bold text-secondary-600">${stats1.minPrice}</div>
                      <div className="text-sm text-gray-600">Lowest Price</div>
                    </div>
                    <div className="text-center p-4 bg-primary-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">${stats1.maxPrice}</div>
                      <div className="text-sm text-gray-600">Highest Price</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No products found for this state
                  </div>
                )}
              </div>

              {/* State 2 Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {comparisonData.state2.name}
                  </h3>
                  <div className="flex items-center text-primary-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="font-medium">{stats2?.count || 0} products</span>
                  </div>
                </div>

                {stats2 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">${stats2.avgPrice}</div>
                      <div className="text-sm text-gray-600">Average Price</div>
                    </div>
                    <div className="text-center p-4 bg-accent-50 rounded-lg">
                      <div className="text-2xl font-bold text-accent-600">{stats2.avgRating}</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="text-center p-4 bg-secondary-50 rounded-lg">
                      <div className="text-2xl font-bold text-secondary-600">${stats2.minPrice}</div>
                      <div className="text-sm text-gray-600">Lowest Price</div>
                    </div>
                    <div className="text-center p-4 bg-primary-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">${stats2.maxPrice}</div>
                      <div className="text-sm text-gray-600">Highest Price</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No products found for this state
                  </div>
                )}
              </div>
            </div>

            {/* Products Comparison */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 text-center">
                Featured Products Comparison
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* State 1 Products */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    Top Products from {comparisonData.state1.name}
                  </h3>
                  <div className="space-y-4">
                    {comparisonData.state1.products.map((product) => (
                      <ProductComparisonCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>

                {/* State 2 Products */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    Top Products from {comparisonData.state2.name}
                  </h3>
                  <div className="space-y-4">
                    {comparisonData.state2.products.map((product) => (
                      <ProductComparisonCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cultural Insights */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Cultural Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {comparisonData.state1.name} Characteristics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-primary-600 mr-3" />
                      <span className="text-gray-700">Traditional techniques and materials</span>
                    </div>
                    <div className="flex items-center">
                      <Palette className="w-5 h-5 text-primary-600 mr-3" />
                      <span className="text-gray-700">Distinctive color patterns and designs</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-primary-600 mr-3" />
                      <span className="text-gray-700">Time-honored craftsmanship methods</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {comparisonData.state2.name} Characteristics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-accent-600 mr-3" />
                      <span className="text-gray-700">Unique regional artistic traditions</span>
                    </div>
                    <div className="flex items-center">
                      <Palette className="w-5 h-5 text-accent-600 mr-3" />
                      <span className="text-gray-700">Local cultural motifs and symbols</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-accent-600 mr-3" />
                      <span className="text-gray-700">Generational knowledge and skills</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!comparisonData && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Ready to Compare States?
            </h3>
            <p className="text-gray-600 mb-6">
              Select two states above to see how their products differ in design, 
              cultural significance, and craftsmanship.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

const ProductComparisonCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-primary-600">
            {product.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
          <p className="text-sm text-gray-600">{product.artisan?.businessName}</p>
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating?.average || 0) ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-1">({product.rating?.count || 0})</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-primary-600">${product.price}</span>
            <div className="flex gap-1">
              <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
