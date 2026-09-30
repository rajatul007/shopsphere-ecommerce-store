# ShopSphere — Full-Stack E-Commerce Platform

ShopSphere is a modern full-stack e-commerce web application built for browsing products, managing shopping carts, placing orders, and managing user accounts.

The project includes a responsive storefront, authentication, product management, cart functionality, order management, and an admin dashboard.

## Features

* User registration and login
* JWT-based authentication
* Product browsing and product details
* Product categories and filtering
* Shopping cart management
* Checkout and order creation
* Order history
* User profile management
* Admin dashboard
* Product and user management
* Responsive interface
* MongoDB database integration
* Database seeding with sample products and users
* REST API architecture
* Secure HTTP headers with Helmet
* CORS configuration
* Environment-based configuration

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Lucide React
* Motion

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs
* Helmet
* CORS

### Development Tools

* Vite
* TypeScript
* TSX
* ESLint/TypeScript checking

## Project Structure

```text
ShopSphere/
│
├── backend/
│   ├── config/
│   │   └── db.ts
│   │
│   ├── middleware/
│   │   └── errorMiddleware.ts
│   │
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── seed.ts
│
├── frontend/
│   ├── index.html
│   ├── products.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── orders.html
│   └── admin.html
│
├── src/
│   └── assets/
│       └── images/
│
├── server.ts
├── package.json
├── vite.config.ts
├── .env.example
├── .gitignore
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/rajatul007/shopsphere-ecommerce-store.git
```

Move into the project directory:

```bash
cd shopsphere-ecommerce-store
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Do not commit the `.env` file to GitHub.

The `.env.example` file is provided as a template for local configuration.

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will run on:

```text
http://localhost:3000
```

## Database Seeding

ShopSphere includes a database seed script for creating sample users, products, and order data.

Run:

```bash
npm run seed
```

The seed script can be used during development to populate the database with sample data.

## Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the development server       |
| `npm start`       | Start the application              |
| `npm run seed`    | Seed the database with sample data |
| `npm run build`   | Build the application              |
| `npm run preview` | Preview the production build       |
| `npm run lint`    | Run TypeScript checking            |

## Application Routes

| Route       | Description       |
| ----------- | ----------------- |
| `/`         | Home page         |
| `/products` | Product listing   |
| `/product`  | Product details   |
| `/cart`     | Shopping cart     |
| `/checkout` | Checkout          |
| `/login`    | User login        |
| `/register` | User registration |
| `/profile`  | User profile      |
| `/orders`   | Order history     |
| `/admin`    | Admin dashboard   |

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Products

```text
GET /api/products
GET /api/products/:id
```

### Cart

```text
GET /api/cart
POST /api/cart
PUT /api/cart/:id
DELETE /api/cart/:id
```

### Orders

```text
POST /api/orders
GET /api/orders
GET /api/orders/:id
```

### Users

```text
GET /api/users/profile
PUT /api/users/profile
```

The exact available endpoints may depend on the route implementations in the backend.

## Authentication

ShopSphere uses JWT-based authentication.

After successful login, the application uses the authentication token to authorize protected API requests.

Passwords are handled using bcryptjs rather than being stored as plain text.

## Admin Dashboard

The admin section provides functionality for managing the e-commerce application.

Depending on the implemented backend permissions, administrators can manage:

* Products
* Users
* Orders
* Store data

The admin dashboard is available at:

```text
/admin
```

## Security

The application includes several security-related configurations:

* JWT authentication
* Password hashing with bcryptjs
* Helmet security headers
* CORS configuration
* Environment variables for sensitive configuration
* Protected API routes
* Centralized error handling

## Development

For development, make sure MongoDB is available and the required environment variables are configured.

Then run:

```bash
npm install
npm run dev
```

For database sample data:

```bash
npm run seed
```

## Deployment

The application can be deployed using a Node.js-compatible hosting platform.

Before deployment:

1. Configure the production MongoDB connection.
2. Create a strong JWT secret.
3. Set `NODE_ENV=production`.
4. Configure the production `CLIENT_URL`.
5. Install production dependencies.
6. Build the application.
7. Start the server.

Example:

```bash
npm install
npm run build
npm start
```

## Environment Configuration

Production environment variables should be configured through the hosting provider rather than committed to the repository.

Never upload:

```text
.env
```

or real database credentials and JWT secrets to GitHub.

## Project Purpose

ShopSphere was developed as a full-stack e-commerce project demonstrating practical implementation of:

* Frontend development
* Backend API development
* Database integration
* Authentication and authorization
* CRUD operations
* Shopping cart workflows
* Order management
* Admin functionality
* Responsive web application development

## Author

**Rajatul**

GitHub:

https://github.com/rajatul007

## License

This project is intended for educational and portfolio purposes.
