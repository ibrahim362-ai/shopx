# Modern E-Commerce Platform

A full-stack e-commerce platform built with React, Node.js, Express, MySQL, and Prisma. Features a modern user interface for customers and a comprehensive admin dashboard for store management.

## 🚀 Features

### Public User Features
- **Home Page**: Hero section, featured products, categories showcase
- **Products Page**: Product listing with search, filtering, and pagination
- **Product Detail**: Detailed product view with image gallery and cart functionality
- **About Page**: Company information and team showcase
- **Contact Page**: Contact form with phone number and message submission
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Admin Dashboard Features
- **Secure Authentication**: JWT-based admin login system (username/password)
- **Dashboard Overview**: Statistics and quick actions
- **Product Management**: Full CRUD operations for products
- **Message Management**: View and manage customer inquiries with phone numbers
- **Email Reply System**: Reply to customer messages directly via email
- **Settings Management**: Site configuration and admin account settings
- **Image Upload**: Cloudinary integration for product images

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router DOM** for navigation with future flags
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **Prisma ORM** with MySQL database
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Cloudinary** for image storage
- **Nodemailer** for email functionality
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- Cloudinary account (for image uploads)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce-platform
```

### 2. Backend Setup
```bash
cd server
npm install
```

### 3. Environment Configuration
Create a `.env` file in the server directory:
```env
DATABASE_URL="mysql://username:password@localhost:3306/ecommerce_store"
JWT_SECRET="your-super-secret-jwt-key-here"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
PORT=5000
NODE_ENV=development

# Email Configuration (for Reply via Email feature)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="your-email@gmail.com"
FROM_NAME="Your Store Support"
```

> **Note**: For email setup instructions, see [EMAIL_SETUP.md](EMAIL_SETUP.md)

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database with admin user
npm run db:seed
```

### 5. Frontend Setup
```bash
cd ../client
npm install
```

### 6. Start Development Servers

**Backend (Terminal 1):**
```bash
cd server
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Default Admin Credentials

After running the database seed:
- **Username**: admin
- **Password**: admin123

## 📁 Project Structure

```
ecommerce-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth, Cart)
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin dashboard pages
│   │   │   └── ...         # Public pages
│   │   └── ...
│   └── ...
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── prisma/             # Database schema and seed
│   └── ...
└── README.md
```

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get all categories
- `POST /api/messages` - Submit contact message (with optional phone)
- `GET /api/health` - Health check

### Admin Endpoints (Protected)
- `POST /api/auth/login` - Admin login (username/password)
- `GET /api/auth/me` - Get current admin
- `PUT /api/auth/change-password` - Change admin password
- `GET /api/products/admin/all` - Get all products (admin view)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/messages` - Get all messages
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/reply` - Reply to message via email
- `POST /api/messages/test-email` - Test email configuration
- `PUT /api/settings` - Update site settings
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images

## 🎨 Key Features Implementation

### Authentication & Security
- Username-based authentication (no email required)
- JWT-based authentication
- Password hashing with bcrypt
- Protected admin routes
- Input validation and sanitization
- Security headers with Helmet
- Rate limiting

### Database Design
- Clean MySQL schema with Prisma
- Relationships between products, categories, and messages
- Optional phone number field in messages
- Efficient indexing for search and filtering
- Data validation at database level

### User Experience
- Responsive design for all devices
- Loading states and error handling
- Toast notifications for user feedback
- Intuitive navigation and search
- Shopping cart functionality
- React Router with future flags enabled

### Admin Dashboard
- Comprehensive product management
- Message handling system with phone numbers
- Email reply functionality for customer support
- Site configuration options
- Secure file upload system
- Clean, production-ready interface

## 🚀 Production Ready

This codebase is production-ready with:
- ✅ Clean database (no demo data)
- ✅ Generic branding (easily customizable)
- ✅ Proper error handling
- ✅ Security best practices
- ✅ Environment configuration
- ✅ Scalable architecture
- ✅ Clean code structure

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
- Check the documentation
- Review the API endpoints

---

Built with ❤️ using modern web technologies.