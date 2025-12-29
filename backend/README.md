# Dolce Fiore Backend

Django REST Framework backend for the Dolce Fiore e-commerce platform.

## Features

- **User Authentication** - Signup, login, logout with session-based authentication
- **Product Catalog** - Products with images, tags, categories, and filtering
- **Shopping Cart** - Add, update, remove items with quantity management
- **Order Management** - Create orders with customer details and shipping information
- **Payment Integration** - Payment order creation (ready for Razorpay/Stripe)
- **Content Management** - Dynamic content for home page sections (Sustainable Gifting, Testimonials) and About Us page (About Us, Our Story, Our Commitment, Photo Gallery, Blogs)
- **Admin Dashboard** - User-friendly Django Admin for managing products, orders, and content
- **API Documentation** - Interactive Swagger UI documentation

## Technology Stack

- Django 5.0+
- Django REST Framework
- drf-spectacular (Swagger/OpenAPI documentation)
- SQLite (development database)
- uv (Python package manager)

## Prerequisites

- Python 3.11 or higher
- uv package manager

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd backend
   ```

2. **Install uv** (if not already installed)
   ```bash
   # Windows (PowerShell)
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

3. **Install dependencies**
   ```bash
   uv sync
   ```

4. **Set up environment variables**
   ```bash
   # Copy .env.example to .env (if exists, or create manually)
   # Set SECRET_KEY and other required variables
   ```

5. **Run migrations**
   ```bash
   uv run python manage.py migrate
   ```

6. **Create superuser** (for admin access)
   ```bash
   uv run python manage.py createsuperuser
   # Or use the custom command:
   uv run python manage.py create_superuser
   ```

7. **Load mock products** (MANDATORY)
   ```bash
   uv run python manage.py load_mock_products
   ```
   This will load all 8 mock products from the frontend mock data.

## Running the Server

```bash
uv run python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/docs/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## Django Admin

Access the admin dashboard at: http://localhost:8000/admin/

Use the superuser credentials created earlier to log in.

### Admin Features

- **Products**: Add, edit, delete products with image management
- **Orders**: View and manage orders with status updates
- **Cart**: View user carts and cart items
- **Payments**: Track payment orders
- **Users**: Manage user accounts
- **Content**: Manage sustainable gifting items, testimonials (text and video) for home page, and About Us page content (About Us, Our Story, Our Commitment sections, Photo Gallery items, and Blog posts)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - List all products (with filtering, search, sorting)
- `GET /api/products/{slug}` - Get product by slug

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item quantity
- `DELETE /api/cart/{id}/delete` - Remove item from cart

### Orders
- `GET /api/orders` - List user's orders
- `POST /api/orders` - Create new order

### Payments
- `POST /api/payments/create-order` - Create payment order

### Content
- `GET /api/content/sustainable-gifting/` - Get sustainable gifting items for home page
- `GET /api/content/testimonials/text/` - Get text-based testimonials for home page
- `GET /api/content/testimonials/video/` - Get video-based testimonials for home page
- `GET /api/content/about-us/` - Get About Us section (with default fallback if none exists)
- `GET /api/content/our-story/` - Get Our Story section (with default fallback if none exists)
- `GET /api/content/our-commitment/` - Get Our Commitment sections
- `GET /api/content/photo-gallery/` - Get photo gallery items
- `GET /api/content/blogs/` - Get blog posts (ordered by published date, newest first)

## Project Structure

```
backend/
├── apps/
│   ├── users/          # User authentication
│   ├── products/       # Product catalog
│   ├── cart/           # Shopping cart
│   ├── orders/         # Order management
│   ├── payments/       # Payment processing
│   └── content/        # Content management (home page sections: sustainable gifting, testimonials; About Us page: about us, our story, our commitment, photo gallery, blogs)
├── config/             # Django project settings
├── manage.py
├── requirements.txt    # Python dependencies
└── README.md
```

## Development

### Running Migrations

```bash
uv run python manage.py makemigrations
uv run python manage.py migrate
```

### Creating Management Commands

Management commands are located in `apps/{app_name}/management/commands/`

### Adding New Products

1. Via Django Admin: http://localhost:8000/admin/products/product/add/
2. Via management command: Modify `load_mock_products.py` and run it

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Notes

- The backend uses SQLite for development (can be switched to PostgreSQL for production)
- Mock products are loaded via the `load_mock_products` management command
- All API endpoints are prefixed with `/api/`
- CORS is configured to allow requests from the frontend (http://localhost:5173)

## Support

For questions or issues, please contact the development team.

