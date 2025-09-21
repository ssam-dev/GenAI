import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { productsAPI } from '../lib/api';
import { 
  ArrowRight, 
  Star, 
  MapPin, 
  Users, 
  Award, 
  Heart,
  ShoppingCart,
  Search
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, statesRes] = await Promise.all([
          productsAPI.getProducts({ limit: 8, sortBy: 'rating', sortOrder: 'desc' }),
          productsAPI.getCategories(),
          productsAPI.getStates()
        ]);

        // Filter out specific products by name
        const filteredProducts = productsRes.data.products.filter(
          product => !['hgvghj', 'pot'].includes(product.name.toLowerCase())
        );
        setFeaturedProducts(filteredProducts);
        setCategories(categoriesRes.data.slice(0, 6));
        setStates(statesRes.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: <Award className="w-8 h-8 text-primary-600" />,
      title: 'Authentic Crafts',
      description: 'Handpicked authentic products from skilled artisans across the country'
    },
    {
      icon: <Heart className="w-8 h-8 text-primary-600" />,
      title: 'Cultural Heritage',
      description: 'Each product tells a story of cultural significance and traditional craftsmanship'
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: 'Support Artisans',
      description: 'Direct support to local artisans and their communities'
    },
    {
      icon: <MapPin className="w-8 h-8 text-primary-600" />,
      title: 'Regional Diversity',
      description: 'Discover unique crafts from different states and cultural backgrounds'
    }
  ];

  const stats = [
    { number: '500+', label: 'Artisans' },
    { number: '2000+', label: 'Products' },
    { number: '50+', label: 'States' },
    { number: '10K+', label: 'Happy Customers' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-accent-50 py-20 overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Discover Authentic
                <span className="text-gradient block">Cultural Treasures</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with skilled artisans and explore handcrafted products that celebrate 
                cultural heritage and traditional craftsmanship from across the country.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center">
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="w-full h-32 rounded-lg mb-3 overflow-hidden">
                      <Image 
                        src="/images/image.png" 
                        alt="Handwoven Textiles" 
                        width={128} 
                        height={128} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900">Colorful Geometric & Floral Motifs</h3>
                    <p className="text-sm text-gray-600">From Gujarat</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="w-full h-32 rounded-lg mb-3 overflow-hidden">
                      <Image 
                        src="/img/up.jpg" 
                        alt="Ceramic Pottery"
                        width={128} 
                        height={128} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900">Miniature Paintings</h3>
                    <p className="text-sm text-gray-600">From Uttar Pradesh</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="w-full h-32 rounded-lg mb-3 overflow-hidden">
                      <Image 
                        src="/images/jk1.jpg" 
                        alt="Crafts – Hand-Painted Kashmiri" 
                        width={128} 
                        height={128} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900">Papier-Mâché Crafts – Hand-Painted Kashmiri Art Pieces</h3>
                    <p className="text-sm text-gray-600">From Jammu Kashmir</p>
                  </div> 
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="w-full h-32 rounded-lg mb-3 overflow-hidden">
                      <Image 
                        src="/img/up1.jpg" 
                        alt="Glass Painting and Lacquer Work"
                        width={128} 
                        height={128} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900">Glass Painting and Lacquer Work</h3>
                    <p className="text-sm text-gray-600">From Uttar Pradesh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ArtisanCraft?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to preserving cultural heritage while supporting local artisans 
              and providing you with authentic, meaningful products.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600">
              Handpicked treasures from our talented artisans
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 rounded h-4"></div>
                    <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                    <div className="bg-gray-200 rounded h-6 w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <div key={product._id} className="card group hover:transform hover:scale-105 transition-all duration-300">
                  <Link href={`/products/${product._id}`} className="relative overflow-hidden rounded-t-xl block">
                    <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary-600">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-50">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/products/${product._id}`} className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-primary-600 block">{product.name}</Link>
                    <p className="text-sm text-gray-600 mb-2">{product.artisan?.businessName}</p>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating?.average || 0) ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">({product.rating?.count || 0})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">₹ {new Intl.NumberFormat('en-IN').format(product.price)}</span>
                      <div className="flex items-center gap-2">
                        <Link href={`/products/${product._id}`} className="btn-outline text-sm px-3 py-1">
                          View
                        </Link>
                        <Link href={`/products/${product._id}`} className="btn-primary text-sm px-3 py-1 inline-flex items-center">
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Link href="/products" className="btn-outline text-lg px-8 py-3 inline-flex items-center">
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Discover Authentic Crafts?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of customers who have found their perfect cultural treasures
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors text-lg">
              Start Shopping
            </Link>
            <Link href="/artisan/register" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-all text-lg">
              Become an Artisan
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
