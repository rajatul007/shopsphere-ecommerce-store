# ShopSphere — Full-Stack E-Commerce Platform

A production-grade, responsive full-stack e-commerce web application built with **Node.js, Express.js, MongoDB, Mongoose, and Vanilla JavaScript (ES6+ Modules)**. Engineered with a focus on clean design principles, secure JWT authentication, real-time database transactions, and an intuitive administrative portal.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Project Architecture](#project-architecture)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [Database Setup & Seeding](#database-setup--seeding)
8. [API Documentation](#api-documentation)
9. [Authentication & Authorization](#authentication--authorization)
10. [Admin Portal](#admin-portal)
11. [Screenshots](#screenshots)
12. [Future Improvements](#future-improvements)
13. [License](#license)

---

## Project Overview

**ShopSphere** is a curated digital commerce storefront designed for modern lifestyles. The application delivers a streamlined end-to-end purchasing workflow: from dynamic catalog filtering and real-time stock verification to cart persistence, checkout, order generation, and merchant administrative controls.

Built without heavy frontend client frameworks, ShopSphere demonstrates mastery of core web fundamentals: semantic HTML5, modern CSS3 (custom properties, flexbox, CSS grid, and micro-interactions), and modular Vanilla JavaScript.

---

## Key Features

### Storefront & Catalog
- **Dynamic Product Filtering**: Instant multi-attribute search across product names, descriptions, categories, and price ranges.
- **Sorting Mechanisms**: Sort products by newest arrivals, price (ascending/descending), and customer ratings.
- **Rich Product Details (PDP)**: Contiguous purchase module featuring high-resolution galleries, quantity selectors, live stock indicators, and contextual product recommendations.
- **Responsive Across Viewports**: Handcrafted fluid layouts tested across 360px (mobile), 768px (tablet), 1024px (laptop), and 1440px+ (desktop).

### Cart & Checkout
- **Persistent Shopping Bag**: Full CRUD operations for cart items (add, update quantity, remove, clear) synchronized with MongoDB for logged-in accounts.
- **Real-Time Total Calculations**: Automatic subtotal tallying, dynamic shipping computation (free shipping threshold over $100), and final amount calculations.
- **Checkout Workflow**: Two-column checkout interface capturing shipping addresses and payment preferences (Cash on Delivery or simulated Online Card Payment).
- **Order Confirmation**: Generates a unique order reference number with an itemized receipt and estimated delivery scheduling.

### User Account & Management
- **Secure Authentication**: JWT-based stateless authentication with password hashing via `bcryptjs`.
- **User Profile**: View and edit contact details, phone number, and default delivery addresses.
- **Order History**: Track past purchases, current fulfillment status, and delivery milestones.

### Merchant & Admin Dashboard
- **Executive Metrics**: Real-time sales revenue, total order volume, catalog count, and registered customer tallies.
- **Catalog Management (CRUD)**: Create new products with custom specifications, edit existing listings, adjust pricing/stock, and delete discontinued items.
- **Order Fulfillment**: Track all customer orders and advance statuses (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- **Customer Directory**: View all registered users and shipping locations.

---

## Technology Stack

### Frontend
- **HTML5**: Semantic document structure adhering to accessibility (WCAG AA) standards.
- **CSS3**: Custom CSS architecture with clean color distribution (60-30-10 rule), smooth transitions ($\le 200\text{ms}$), tabular numeral alignment, and responsive grid layouts.
- **Vanilla JavaScript (ES6+)**: Native module pattern (`import`/`export`), Fetch API client with automatic token attachment, custom event buses, and zero external framework lock-in.

### Backend
- **Node.js**: Asynchronous event-driven runtime environment.
- **Express.js**: RESTful API architecture with modular routers, controller-service patterns, and central error-handling middleware.
- **JWT (JSON Web Tokens)**: Secure token issuance and verification middleware.
- **bcryptjs**: Salt-hashed password encryption (10 rounds).
- **Helmet & CORS**: HTTP security header protection and Cross-Origin Resource Sharing governance.

### Database
- **MongoDB**: Document-oriented NoSQL database.
- **Mongoose**: Strict schema validation, pre-save encryption hooks, model population, and relational querying.
- **MongoMemoryServer**: Automatic embedded in-memory MongoDB instance fallback when external MongoDB URI is not configured, enabling zero-config local testing.

---

## Project Architecture

```
shopsphere/
│
├── frontend/
│   ├── index.html            # Landing & storefront home page
│   ├── products.html         # Catalog with search & filtering
│   ├── product.html          # Individual product details view
│   ├── cart.html             # Persistent shopping bag
│   ├── checkout.html         # Shipping address & order checkout
│   ├── login.html            # User authentication sign-in
│   ├── register.html         # User account registration
│   ├── profile.html          # Account settings & default shipping
│   ├── orders.html           # Customer order tracking history
│   ├── admin.html            # Merchant administrative dashboard
│   │
│   ├── css/
│   │   └── style.css         # Unified stylesheet & design system
│   │
│   └── js/
│       ├── api.js            # Fetch client, auth headers & toast manager
│       ├── auth.js           # Session state, login/register & route guards
│       ├── products.js       # Catalog fetching, filtering & card rendering
│       ├── product-detail.js # PDP gallery, quantity stepper & buy-now
│       ├── cart.js           # Cart state, item stepper & summary calculations
│       ├── checkout.js       # Form validation & order confirmation
│       ├── profile.js        # Profile updates & password change
│       ├── orders.js         # User order listing & status indicators
│       ├── admin.js          # Admin stats, catalog CRUD & order status
│       └── main.js           # Header, footer, cart badge & common utils
│
├── backend/
│   ├── config/
│   │   └── db.ts             # MongoDB / Mongoose connection manager
│   ├── models/
│   │   ├── User.ts           # User schema, password hashing & cart items
│   │   ├── Product.ts        # Product schema, pricing & inventory
│   │   └── Order.ts          # Order schema, address & status enums
│   ├── routes/
│   │   ├── authRoutes.ts     # /api/auth routes
│   │   ├── productRoutes.ts  # /api/products routes
│   │   ├── cartRoutes.ts     # /api/cart routes
│   │   ├── orderRoutes.ts    # /api/orders routes
│   │   └── userRoutes.ts     # /api/users & admin routes
│   ├── middleware/
│   │   ├── authMiddleware.ts # JWT protect & adminOnly middleware
│   │   └── errorMiddleware.ts# Centralized error & 404 handlers
│   ├── controllers/
│   │   ├── authController.ts # User registration, login, getMe
│   │   ├── productController.ts # Catalog query, details, CRUD
│   │   ├── cartController.ts # Cart item synchronization
│   │   ├── orderController.ts# Order placement, status modification
│   │   └── userController.ts # Profile management & admin statistics
│   └── seed.ts               # Database sample seeder
│
├── server.ts                 # Express server entry point & static file routing
├── package.json              # Project dependencies & scripts
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
└── README.md                 # Complete project documentation
```

---

## Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** or **yarn**

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/shopsphere.git
   cd shopsphere
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Network port for the Express application | `3000` |
| `MONGODB_URI` | MongoDB connection string (Atlas or Local) | Embedded In-Memory fallback |
| `JWT_SECRET` | Secret key used for signing JSON Web Tokens | `shopsphere_super_secret_jwt_key_2026_portfolio` |
| `NODE_ENV` | Application environment mode | `development` |

*Note: If `MONGODB_URI` is left blank, the application automatically launches an embedded in-memory MongoDB server via `mongodb-memory-server` and pre-populates sample data, allowing instantaneous local evaluation without external database configuration.*

---

## Database Setup & Seeding

The application includes an automated database seeder (`backend/seed.ts`). When the server starts for the first time, it automatically initializes:
- **Default Admin Account**: `admin@shopsphere.com` / `admin123`
- **Default Customer Account**: `alex@shopsphere.com` / `user123`
- **14+ Curated Products** across Electronics, Fashion, Shoes, Accessories, Home & Living, and Beauty.
- **Sample Verified Orders** with shipping addresses and order numbers.

To manually re-seed the database at any time:
```bash
npm run seed
```

---

## API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new customer account
- `POST /api/auth/login` — Authenticate user and receive JWT token
- `GET /api/auth/me` — Fetch currently authenticated user profile *(Private)*

### Products (`/api/products`)
- `GET /api/products` — Retrieve products with optional query filters (`keyword`, `category`, `minPrice`, `maxPrice`, `sort`, `featured`)
- `GET /api/products/:id` — Retrieve product details and related recommendations
- `POST /api/products` — Add a new product *(Admin Only)*
- `PUT /api/products/:id` — Update product details or stock *(Admin Only)*
- `DELETE /api/products/:id` — Delete product *(Admin Only)*

### Shopping Cart (`/api/cart`)
- `GET /api/cart` — Fetch current user's populated cart and totals *(Private)*
- `POST /api/cart` — Add product to cart or increment quantity *(Private)*
- `PUT /api/cart/:productId` — Update item quantity *(Private)*
- `DELETE /api/cart/:productId` — Remove specific item from cart *(Private)*
- `DELETE /api/cart` — Clear entire shopping bag *(Private)*

### Orders (`/api/orders`)
- `POST /api/orders` — Place a new order with shipping details *(Private)*
- `GET /api/orders` — Retrieve logged-in user's order history *(Private)*
- `GET /api/orders/:id` — Retrieve order receipt by ID *(Private)*
- `GET /api/orders/admin/all` — Retrieve all orders across the system *(Admin Only)*
- `PUT /api/orders/:id/status` — Update order status and payment status *(Admin Only)*

### Users & Administration (`/api/users`)
- `GET /api/users/profile` — Fetch user profile *(Private)*
- `PUT /api/users/profile` — Update name, phone, address, or password *(Private)*
- `GET /api/users` — List all registered users *(Admin Only)*
- `GET /api/users/admin/stats` — Executive dashboard statistics *(Admin Only)*

---

## Authentication & Authorization

Authentication is implemented via standard Bearer tokens in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```
Tokens are stored in client-side `localStorage` under `shopsphere_token`. Middleware on the server verifies the signature, looks up the corresponding user, and verifies role credentials (`user` vs `admin`).

### Test Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@shopsphere.com` | `admin123` | Storefront + Admin Dashboard + Product CRUD + Order Status Management |
| **Customer** | `alex@shopsphere.com` | `user123` | Storefront + Cart + Checkout + Order History + Profile Management |

*Quick test fill buttons are available on the Sign In page for one-click testing.*

---

## Admin Portal

Navigating to `/admin.html` with an administrator account unlocks:
1. **Financial Overview**: Total revenue calculation from all active orders.
2. **Catalog Controls**: Real-time product creation modal with category assignment, pricing, image linking, and description fields.
3. **Fulfillment Pipeline**: Instant dropdown status updating for customer orders with automatic delivery payment reconciliations.
4. **User Tracking**: Directory of active customers and their registered locations.

---

## Screenshots

*(Screenshots can be added here displaying Home, Catalog, Product Details, Cart, Checkout, and Admin views).*

---

## Future Improvements

- Integration of Stripe Elements for live card tokenization.
- Multi-currency conversion and international tax estimation.
- User review submission and image attachment on product detail pages.
- Automated email dispatch for order confirmations using Nodemailer or SendGrid.
- Wishlist and save-for-later functionality.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
