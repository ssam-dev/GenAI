import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { artisansAPI } from '../../lib/api';
import { MapPin, Award, Star, Globe, Instagram, Facebook } from 'lucide-react';

const ArtisanProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await artisansAPI.getArtisan(id);
        setArtisan(res.data.artisan);
        setProducts(res.data.products || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load artisan', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-center text-gray-600">Loading artisan...</div>
        ) : !artisan ? (
          <div className="text-center text-gray-600">Artisan not found.</div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">{artisan.businessName?.charAt(0)}</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{artisan.businessName}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{artisan.region?.city}, {artisan.region?.state}</span>
                      <span className="flex items-center"><Award className="w-4 h-4 mr-1" />{artisan.experience} yrs</span>
                      <span className="flex items-center text-primary-600"><Star className="w-4 h-4 mr-1" />{artisan.rating?.average?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {artisan.socialMedia?.website && (
                    <a href={artisan.socialMedia.website} target="_blank" rel="noreferrer" className="btn-outline flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                  {artisan.socialMedia?.instagram && (
                    <a href={`https://instagram.com/${artisan.socialMedia.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="btn-outline flex items-center gap-2 text-sm">
                      <Instagram className="w-4 h-4" /> Instagram
                    </a>
                  )}
                  {artisan.socialMedia?.facebook && (
                    <a href={artisan.socialMedia.facebook} target="_blank" rel="noreferrer" className="btn-outline flex items-center gap-2 text-sm">
                      <Facebook className="w-4 h-4" /> Facebook
                    </a>
                  )}
                </div>
              </div>
              <p className="text-gray-700 mt-4 whitespace-pre-line">{artisan.description}</p>
              {artisan.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {artisan.specialties.map((s) => (
                    <span key={s} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full capitalize">{s}</span>
                  ))}
                </div>
              )}
              {artisan.region?.culturalBackground && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Cultural Background</h3>
                  <p className="text-gray-700">{artisan.region.culturalBackground}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
              {products.length === 0 ? (
                <div className="text-gray-600">No products yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <div key={p._id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="aspect-square bg-gray-100" />
                      <div className="p-4">
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-primary-600 font-semibold mt-1">₹ {p.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ArtisanProfilePage;


