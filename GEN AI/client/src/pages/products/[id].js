import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import { productsAPI, cartAPI, usersAPI } from '../../lib/api';
import { useAuth } from '../../lib/context';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  MapPin, 
  Clock, 
  Award,
  Palette,
  Users,
  ArrowLeft,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (!product || !isAuthenticated) return;
    checkIsFavorited();
  }, [product, isAuthenticated]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProduct(id);
      setProduct(response.data.product);
      setRelatedProducts(response.data.relatedProducts);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await cartAPI.addToCart(product._id, quantity);
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const checkIsFavorited = async () => {
    try {
      const res = await usersAPI.getWishlist();
      const exists = res.data.wishlist?.some((p) => p._id === product._id);
      setIsFavorited(Boolean(exists));
    } catch (e) {
      // ignore
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    try {
      if (isFavorited) {
        await usersAPI.removeFromWishlist(product._id);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await usersAPI.addToWishlist(product._id);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (e) {
      toast.error('Could not update favorites');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-lg h-96"></div>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/products" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center">
              <span className="text-8xl font-bold text-primary-600">
                {product.name.charAt(0)}
              </span>
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating?.average || 0) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">({product.rating?.count || 0} reviews)</span>
                </div>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-3xl font-bold text-primary-600 mb-4">₹ {new Intl.NumberFormat('en-IN').format(product.price)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>By {product.artisan?.businessName}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{product.culturalSignificance?.regionOfOrigin?.state}</span>
                </div>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 btn-primary py-3 disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={toggleFavorite}
                  className={`p-3 border rounded-lg hover:bg-gray-50 ${isFavorited ? 'border-primary-300 text-primary-600' : 'border-gray-300'}`}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Category:</span>
                  <span className="ml-2 text-gray-600 capitalize">{product.category}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">SKU:</span>
                  <span className="ml-2 text-gray-600">{product.inventory?.sku || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Availability:</span>
                  <span className="ml-2 text-gray-600">{product.inventory?.quantity || 0} in stock</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Time to Create:</span>
                  <span className="ml-2 text-gray-600">{product.culturalSignificance?.timeToCreate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cultural Significance */}
        <div className="mt-16 space-y-12">
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Cultural Significance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-primary-600" />
                  Historical Background
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.culturalSignificance?.history}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-accent-600" />
                  Symbolic Meaning
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.culturalSignificance?.symbolism}
                </p>
              </div>
            </div>
          </div>

          {/* Artisan Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Artisan</h2>
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
                  {product.artisan?.businessName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.artisan?.businessName}
                </h3>
                <p className="text-gray-600 mb-4">
                  {product.artisan?.description}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{product.artisan?.region?.city}, {product.artisan?.region?.state}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{product.artisan?.experience} years experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct._id}
                    href={`/products/${relatedProduct._id}`}
                    className="card group hover:transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="relative overflow-hidden rounded-t-xl">
                      <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary-600">
                          {relatedProduct.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{relatedProduct.artisan?.businessName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">${relatedProduct.price}</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(relatedProduct.rating?.average || 0) ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
