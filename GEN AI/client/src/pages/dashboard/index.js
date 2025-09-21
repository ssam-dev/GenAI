import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../lib/context';
import { artisansAPI, productsAPI } from '../../lib/api';
import { 
  Package, 
  TrendingUp, 
  Star, 
  Eye, 
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Users,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

    fetchDashboardData();
  }, [isAuthenticated, isLoading, user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user's artisan profile
      const artisanResponse = await artisansAPI.getMyArtisan();
      const artisanProfile = artisanResponse.data.artisan;
      
      if (!artisanProfile) {
        router.push('/artisan/setup');
        return;
      }

      setArtisan(artisanProfile);

      // Get dashboard data
      const dashboardResponse = await artisansAPI.getArtisanDashboard(artisanProfile._id);
      setStats(dashboardResponse.data.stats);
      setProducts(dashboardResponse.data.recentProducts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsAPI.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[50vh] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!artisan) {
    return (
      <Layout>
        <div className="min-h-[50vh] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Artisan Profile Required</h2>
            <p className="text-gray-600 mb-6">Please complete your artisan profile to access the dashboard.</p>
            <Link href="/artisan/setup" className="btn-primary">
              Complete Profile
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{artisan.businessName}</h1>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${artisan.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {artisan.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <p className="text-gray-600 mt-1">Dashboard • {artisan.region?.city}, {artisan.region?.state}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/artisans/${artisan._id}`} className="btn-outline">
                <Eye className="w-4 h-4 mr-2" />
                View Storefront
              </Link>
              <Link href="/products/new" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalSales || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
                  <Link href="/products/manage" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {products.length > 0 ? (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold text-primary-600">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                            <p className="text-sm text-gray-600">{inr.format(product.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/products/${product._id}`}
                            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </Link>
                          <Link
                            href={`/products/edit/${product._id}`}
                            className="px-3 py-1.5 border border-blue-200 text-blue-700 rounded-md text-sm hover:bg-blue-50"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="px-3 py-1.5 border border-red-200 text-red-700 rounded-md text-sm hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-600 mb-4">Showcase your craft by adding your first product.</p>
                    <Link href="/products/new" className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/products/new" className="btn-primary text-center inline-flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Product
                </Link>
                <Link href="/products/manage" className="btn-outline text-center inline-flex items-center justify-center">
                  <Package className="w-4 h-4 mr-2" />
                  Manage Products
                </Link>
                <Link href="/profile" className="btn-outline text-center inline-flex items-center justify-center">
                  <Users className="w-4 h-4 mr-2" />
                  Update Profile
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Complete</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    artisan.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {artisan.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Business Name</span>
                  <span className="text-sm font-medium text-gray-900">{artisan.businessName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location</span>
                  <span className="text-sm font-medium text-gray-900">
                    {artisan.region.city}, {artisan.region.state}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Specialties</span>
                  <span className="text-sm font-medium text-gray-900">
                    {artisan.specialties?.length || 0} categories
                  </span>
                </div>
                <div className="pt-2">
                  <Link href={`/artisans/${artisan._id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View public profile →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default DashboardPage;
