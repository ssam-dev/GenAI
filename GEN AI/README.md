# ArtisanCraft - E-commerce Platform for Local Artisans

A comprehensive e-commerce platform that connects customers with local artisans selling culturally significant products. Built with modern web technologies and designed for scalability and production use.

## 🌟 Features

### For Customers
- **Browse Products**: Explore authentic crafts by category, state, or search
- **Product Comparison**: Compare products from different states side-by-side
- **Cultural Context**: Learn about the history, symbolism, and cultural significance of each product
- **Shopping Cart**: Add products to cart and proceed to checkout
- **User Authentication**: Secure sign-up, login, and profile management
- **Wishlist**: Save favorite products for later
- **Order Tracking**: Track your orders and their status

### For Artisans
- **Artisan Dashboard**: Manage products, view analytics, and track sales
- **Product Management**: Upload products with detailed cultural information
- **Profile Management**: Create and maintain artisan profiles
- **Order Management**: Process and fulfill customer orders
- **Analytics**: View sales statistics and performance metrics

### Platform Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Search & Filtering**: Advanced search and filtering capabilities
- **Cultural Heritage**: Emphasis on cultural significance and traditional craftsmanship
- **Regional Diversity**: Showcase products from different states and cultural backgrounds

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR/SSG
- **React 18** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Database Models
- **User** - Customer and artisan accounts
- **Artisan** - Artisan profiles and business information
- **Product** - Product listings with cultural details
- **Cart** - Shopping cart functionality
- **Order** - Order management and tracking

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd artisan-marketplace
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp server/env.example server/.env
   
   # Edit server/.env with your configuration
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/artisan-marketplace
   JWT_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   
   # Or start individually
   npm run server  # Starts backend on port 5000
   npm run client  # Starts frontend on port 3000
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📁 Project Structure

```
artisan-marketplace/
├── client/                 # Next.js frontend
│   ├── components/         # React components
│   ├── lib/               # Utilities and API client
│   ├── pages/             # Next.js pages
│   ├── styles/            # Global styles
│   └── public/            # Static assets
├── server/                # Express.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── package.json           # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get product categories
- `GET /api/products/states` - Get states with product counts
- `GET /api/products/compare` - Compare products by state
- `POST /api/products` - Create product (artisan)
- `PUT /api/products/:id` - Update product (artisan)
- `DELETE /api/products/:id` - Delete product (artisan)

### Artisans
- `GET /api/artisans` - Get all artisans
- `GET /api/artisans/:id` - Get single artisan
- `GET /api/artisans/:id/products` - Get artisan's products
- `GET /api/artisans/:id/dashboard` - Get artisan dashboard
- `POST /api/artisans` - Create artisan profile
- `PUT /api/artisans/:id` - Update artisan profile

### Cart & Orders
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order

## 🎨 Key Features Implementation

### Product Comparison
The platform includes a unique feature to compare products from different states, allowing customers to see:
- Price differences
- Design variations
- Cultural meanings
- Uniqueness factors

### Cultural Significance
Each product includes detailed cultural information:
- Historical background
- Symbolic meaning
- Region of origin
- Traditional techniques used
- Materials and craftsmanship

### Responsive Design
- Mobile-first approach
- Tailwind CSS for consistent styling
- Smooth animations and transitions
- Accessible design patterns

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet security headers
- Role-based access control

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment (production/development)

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Payment gateway integration
- Advanced analytics dashboard
- Mobile app development
- Multi-language support
- Advanced search with AI
- Social features and reviews
- Subscription model for artisans
- Live chat support
- Advanced inventory management

---

Built with ❤️ for preserving cultural heritage and supporting local artisans.
