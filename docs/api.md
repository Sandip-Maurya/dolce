# API documentation

## Base URLs

| Environment | API base URL |
|-------------|--------------|
| **Local (Docker)** | http://localhost:8080/api |
| **Staging** | https://kakshaonline.com/api |
| **Production** | https://dolcefiore.in/api |

When running backend alone (no Nginx), the API is at `http://localhost:8000/api`.

## Interactive docs (Swagger)

Full request/response shapes and try-it-out are in Swagger UI:

- **With Docker (via Nginx):** http://localhost:8080/api/schema/swagger-ui/
- **Backend only:** http://localhost:8000/api/schema/swagger-ui/

OpenAPI schema (JSON): `/api/schema/`

## Authentication

The API uses **session-based authentication** (cookies). Log in via `/api/auth/login` (or the frontend login page); subsequent requests send the session cookie.

## Endpoints overview

### Authentication

- `POST /api/auth/login` — User login
- `POST /api/auth/signup` — User registration
- `POST /api/auth/logout` — User logout

### Products

- `GET /api/products` — List all products (filtering, search, sorting)
- `GET /api/products/{slug}` — Get product by slug

### Cart

- `GET /api/cart` — Get user's cart
- `POST /api/cart` — Add item to cart
- `PUT /api/cart/{id}` — Update cart item quantity
- `DELETE /api/cart/{id}/delete` — Remove item from cart

### Orders

- `GET /api/orders` — List user's orders
- `POST /api/orders` — Create new order

### Payments

- `POST /api/payments/create-order` — Create payment order

### Content

- `GET /api/content/sustainable-gifting/` — Sustainable gifting items (home page)
- `GET /api/content/testimonials/text/` — Text testimonials (home page)
- `GET /api/content/testimonials/video/` — Video testimonials (home page)
- `GET /api/content/about-us/` — About Us section
- `GET /api/content/our-story/` — Our Story section
- `GET /api/content/our-commitment/` — Our Commitment sections
- `GET /api/content/photo-gallery/` — Photo gallery items
- `GET /api/content/blogs/` — Blog posts (newest first)

All API paths are prefixed with `/api/`. For full request/response schemas, use Swagger UI.
