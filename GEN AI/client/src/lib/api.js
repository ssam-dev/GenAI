import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getStates: () => api.get('/products/states'),
  compareProducts: (state1, state2, category) => 
    api.get('/products/compare', { 
      params: { state1, state2, category } 
    }),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Artisans API
export const artisansAPI = {
  getArtisans: (params) => api.get('/artisans', { params }),
  getMyArtisan: () => api.get('/artisans/me'),
  getArtisan: (id) => api.get(`/artisans/${id}`),
  getArtisanProducts: (id, params) => api.get(`/artisans/${id}/products`, { params }),
  getArtisanDashboard: (id) => api.get(`/artisans/${id}/dashboard`),
  createArtisanProfile: (profileData) => api.post('/artisans', profileData),
  updateArtisanProfile: (id, profileData) => api.put(`/artisans/${id}`, profileData),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity) => 
    api.post('/cart/items', { productId, quantity }),
  updateCartItem: (itemId, quantity) => 
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  updateOrderStatus: (id, status, trackingNumber) => 
    api.put(`/orders/${id}/status`, { status, trackingNumber }),
  getArtisanOrders: (artisanId, params) => 
    api.get(`/orders/artisan/${artisanId}`, { params }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getOrders: (params) => api.get('/users/orders', { params }),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
};

export default api;
