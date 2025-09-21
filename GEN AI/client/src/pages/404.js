import Link from 'next/link';
import Layout from '../components/Layout/Layout';
import { Home, ArrowLeft, Search } from 'lucide-react';

const Custom404 = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find the page you're looking for. 
              It might have been moved, deleted, or doesn't exist.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/" className="btn-primary w-full inline-flex items-center justify-center">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
            
            <Link href="/products" className="btn-outline w-full inline-flex items-center justify-center">
              <Search className="w-4 h-4 mr-2" />
              Browse Products
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full text-gray-600 hover:text-gray-800 inline-flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>If you think this is an error, please contact support.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Custom404;
