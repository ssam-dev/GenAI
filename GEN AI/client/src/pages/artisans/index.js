import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { artisansAPI } from '../../lib/api';
import { 
  Search, 
  MapPin, 
  Star, 
  Award, 
  Users,
  Filter,
  Grid,
  List
} from 'lucide-react';
import Link from 'next/link';

const ArtisansPage = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    specialty: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalArtisans: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchArtisans();
  }, [filters]);

  const fetchArtisans = async () => {
    try {
      setLoading(true);
      const response = await artisansAPI.getArtisans(filters);
      setArtisans(response.data.artisans);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching artisans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our Artisans
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the talented craftspeople behind our authentic cultural products. 
            Each artisan brings generations of traditional knowledge and unique regional techniques.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Artisans
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="input-field"
              >
                <option value="">All States</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Odisha">Odisha</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                className="input-field"
              >
                <option value="">All Specialties</option>
                <option value="textiles">Textiles</option>
                <option value="pottery">Pottery</option>
                <option value="jewelry">Jewelry</option>
                <option value="painting">Painting</option>
                <option value="woodwork">Woodwork</option>
                <option value="metalwork">Metalwork</option>
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
            {pagination.totalArtisans} artisans found
          </p>
        </div>

        {/* Artisans Grid/List */}
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
        ) : artisans.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
            : 'space-y-6'
          }>
            {artisans.map((artisan) => (
              <ArtisanCard 
                key={artisan._id} 
                artisan={artisan} 
                viewMode={viewMode} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No artisans found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
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

const ArtisanCard = ({ artisan, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 flex gap-6">
        <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-3xl font-bold text-primary-600">
            {artisan.businessName.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{artisan.businessName}</h3>
            <div className="flex items-center text-primary-600">
              <Star className="w-4 h-4 mr-1" />
              <span className="font-medium">{artisan.rating?.average?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
          <p className="text-gray-600 mb-3 line-clamp-2">{artisan.description}</p>
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{artisan.region?.city}, {artisan.region?.state}</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2" />
              <span>{artisan.experience} years experience</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {artisan.specialties?.slice(0, 3).map((specialty, index) => (
                <span key={index} className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                  {specialty}
                </span>
              ))}
            </div>
            <Link href={`/artisans/${artisan._id}`} className="btn-primary text-sm px-4 py-2">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="aspect-square bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
        <span className="text-6xl font-bold text-primary-600">
          {artisan.businessName.charAt(0)}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{artisan.businessName}</h3>
          <div className="flex items-center text-primary-600">
            <Star className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{artisan.rating?.average?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{artisan.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{artisan.region?.city}, {artisan.region?.state}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Award className="w-4 h-4 mr-2" />
            <span>{artisan.experience} years experience</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {artisan.specialties?.slice(0, 3).map((specialty, index) => (
            <span key={index} className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
              {specialty}
            </span>
          ))}
          {artisan.specialties?.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{artisan.specialties.length - 3} more
            </span>
          )}
        </div>

        <Link href={`/artisans/${artisan._id}`} className="w-full btn-primary text-center">
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default ArtisansPage;
