import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { connectDB } from './backend/config/db.ts';
import { seedDatabase } from './backend/seed.ts';
import authRoutes from './backend/routes/authRoutes.ts';
import productRoutes from './backend/routes/productRoutes.ts';
import cartRoutes from './backend/routes/cartRoutes.ts';
import orderRoutes from './backend/routes/orderRoutes.ts';
import userRoutes from './backend/routes/userRoutes.ts';
import { errorHandler, notFoundHandler } from './backend/middleware/errorMiddleware.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows loading Google Fonts and local assets smoothly
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (images, css, js)
app.use('/src/assets/images', express.static(path.join(__dirname, 'src', 'assets', 'images')));
app.use(express.static(path.join(__dirname, 'frontend')));

// Clean HTML page routing helpers
const frontendDir = path.join(__dirname, 'frontend');

app.get('/products', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'products.html'));
});

app.get('/product', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'product.html'));
});

app.get('/cart', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'cart.html'));
});

app.get('/checkout', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'checkout.html'));
});

app.get('/login', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'login.html'));
});

app.get('/register', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'register.html'));
});

app.get('/profile', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'profile.html'));
});

app.get('/orders', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'orders.html'));
});

app.get('/admin', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'admin.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// API 404 handler for missing /api routes
app.use('/api/*', notFoundHandler);

// Central error handler
app.use(errorHandler);

// Global fallback for any unmatched non-API page request
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Initialize database and start server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  ShopSphere Server running on port ${PORT}`);
      console.log(`  Access the app at: http://localhost:${PORT}`);
      console.log(`===============================================`);
    });
  } catch (error: any) {
    console.error(`Failed to launch server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
