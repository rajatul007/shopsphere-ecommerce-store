```ts
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
import {
  errorHandler,
  notFoundHandler
} from './backend/middleware/errorMiddleware.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Security
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(
  '/src/assets/images',
  express.static(
    path.join(__dirname, 'src', 'assets', 'images')
  )
);

const frontendDir = path.join(__dirname, 'frontend');

app.use(express.static(frontendDir));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'ShopSphere',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Frontend routes
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

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

// API 404 handler
app.use('/api/*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Frontend fallback
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('===============================================');
      console.log(`  ShopSphere running on port ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('===============================================');
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown server error';

    console.error(`Failed to launch ShopSphere: ${message}`);
    process.exit(1);
  }
};

startServer();

export default app;
```
