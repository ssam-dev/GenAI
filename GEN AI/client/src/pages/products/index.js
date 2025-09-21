import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { productsAPI, usersAPI, cartAPI } from '../../lib/api';
import { useAuth } from '../../lib/context';
import { Heart } from 'lucide-react';
import { 
  Search, 
  Filter, 
  Grid, 
  List,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  Star,
  MapPin,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [viewMode, setViewMode] = useState('grid');

  const categories = [
    'textiles', 'pottery', 'jewelry', 'painting', 
    'woodwork', 'metalwork', 'basketry', 'leatherwork'
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );
      const response = await productsAPI.getProducts(params);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsAPI.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600">Browse handcrafted items from verified artisans</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="input-field"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input-field"
                placeholder="10000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort</label>
              <select
                value={`${filters.sortBy}:${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split(':');
                  setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
                }}
                className="input-field"
              >
                <option value="createdAt:desc">Newest</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="rating:desc">Rating</option>
                <option value="salesCount:desc">Best Selling</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {pagination.totalProducts} products found
          </p>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-200 rounded h-4"></div>
                  <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                  <div className="bg-gray-200 rounded h-6 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
            : 'space-y-6'
          }>
            {products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                viewMode={viewMode}
                onDelete={handleDeleteProduct}
                inr={inr}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Check back soon for new arrivals.</p>
            <Link href="/artisans" className="btn-primary">Explore Artisans</Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.totalPages || 
                  Math.abs(page - pagination.currentPage) <= 1
                )
                .map((page, index, array) => (
                  <div key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        page === pagination.currentPage
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const ProductCard = ({ product, viewMode, onDelete, inr, isAuthenticated }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex gap-6">
        <Link href={`/products/${product._id}`} className="w-32 h-32 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-3xl font-bold text-primary-600">
            {product.name.charAt(0)}
          </span>
        </Link>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <Link href={`/products/${product._id}`} className="text-xl font-semibold text-gray-900 hover:text-primary-600">
              {product.name}
            </Link>
            <div className="flex items-center text-primary-600">
              <Star className="w-4 h-4 mr-1" />
              <span className="font-medium">{product.rating?.average?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
          <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>{inr.format(product.price)}</span>
            </div>
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              <span>{product.inventory?.quantity || 0} in stock</span>
            </div>
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full capitalize">
                {product.category}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/products/${product._id}`}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                View
              </Link>
              <button
                onClick={async () => {
                  try {
                    if (!isAuthenticated) { window.location.href = '/auth/login'; return; }
                    await usersAPI.addToWishlist(product._id);
                    toast.success('Added to favorites');
                  } catch {
                    toast.error('Could not add to favorites');
                  }
                }}
                className="px-3 py-1.5 border border-primary-200 text-primary-700 rounded-md text-sm hover:bg-primary-50 inline-flex items-center gap-2"
              >
                <Heart className="w-4 h-4" /> Favorite
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <Link href={`/products/${product._id}`} className="aspect-square bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
        <span className="text-6xl font-bold text-primary-600">
          {product.name.charAt(0)}
        </span>
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <div className="flex items-center text-primary-600">
            <Star className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{product.rating?.average?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="font-semibold">{inr.format(product.price)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Package className="w-4 h-4 mr-2" />
            <span>{product.inventory?.quantity || 0} in stock</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full capitalize">
            {product.category}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/products/${product._id}`}
            className="flex-1 btn-outline text-center text-sm"
          >
            View
          </Link>
          <button
            onClick={async (e) => {
              e.preventDefault();
              try {
                if (!isAuthenticated) { window.location.href = '/auth/login'; return; }
                await usersAPI.addToWishlist(product._id);
                toast.success('Added to favorites');
              } catch {
                toast.error('Could not add to favorites');
              }
            }}
            className="flex-1 btn-primary text-center text-sm inline-flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" /> Favorite
          </button>
          <button
            onClick={async (e) => {
              e.preventDefault();
              try {
                await cartAPI.addToCart(product._id, 1);
                toast.success('Added to cart');
              } catch {
                toast.error('Could not add to cart');
              }
            }}
            className="flex-1 btn-outline text-center text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;