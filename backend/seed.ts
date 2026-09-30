```ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.ts';
import Product from './models/Product.ts';
import Order from './models/Order.ts';
import { connectDB } from './config/db.ts';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();

    // Skip seeding when the database already contains data
    if (userCount > 0 && productCount > 0) {
      console.log('Database already contains records. Skipping seed.');
      return;
    }

    console.log('Seeding ShopSphere database...');

    // Clear existing seed data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Demo users
    // Passwords are hashed automatically by the User model pre-save hook.
    const users = await User.create([
      {
        name: 'ShopSphere Admin',
        email: 'admin@example.com',
        password: 'Admin@12345',
        role: 'admin',
        phone: '0000000000',
        address: {
          address: 'Demo Address',
          city: 'Demo City',
          state: 'Demo State',
          postalCode: '000000',
          country: 'India'
        }
      },
      {
        name: 'Demo Customer',
        email: 'user@example.com',
        password: 'User@12345',
        role: 'user',
        phone: '0000000000',
        address: {
          address: 'Demo Address',
          city: 'Demo City',
          state: 'Demo State',
          postalCode: '000000',
          country: 'India'
        }
      }
    ]);

    // Sample product catalog
    const sampleProducts = [
      // Electronics
      {
        name: 'AcousticPro Wireless Studio Headphones',
        description:
          'Wireless over-ear headphones with high-quality audio, active noise cancellation, and long battery life. Designed for music, calls, and everyday entertainment.',
        price: 289,
        discountPrice: 249,
        category: 'Electronics',
        image: '/src/assets/images/cat_electronics_audio_1790769932114.jpg',
        rating: 4.9,
        numReviews: 48,
        stock: 18,
        featured: true,
        brand: 'SoundCraft Acoustic'
      },
      {
        name: 'UltraWide Curved 34-inch Studio Display',
        description:
          'A 34-inch ultrawide display with a high refresh rate, wide color coverage, and USB-C connectivity. Suitable for productivity, development, and creative work.',
        price: 749,
        discountPrice: 699,
        category: 'Electronics',
        image: '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg',
        rating: 4.8,
        numReviews: 29,
        stock: 8,
        featured: true,
        brand: 'Horizon Vision'
      },
      {
        name: 'Mechanical Tactile Low-Profile Keyboard',
        description:
          'Low-profile mechanical keyboard with a durable aluminum body, tactile switches, PBT keycaps, and wireless connectivity.',
        price: 159,
        discountPrice: 139,
        category: 'Electronics',
        image: '/src/assets/images/cat_electronics_audio_1790769932114.jpg',
        rating: 4.7,
        numReviews: 64,
        stock: 25,
        featured: false,
        brand: 'KeySmith Works'
      },

      // Fashion
      {
        name: 'Tailored Raw Linen Overshirt',
        description:
          'Lightweight linen overshirt with a relaxed fit, practical chest pockets, and a versatile design for everyday wear.',
        price: 145,
        discountPrice: 119,
        category: 'Fashion',
        image: '/src/assets/images/cat_fashion_minimal_1790769946284.jpg',
        rating: 4.8,
        numReviews: 34,
        stock: 22,
        featured: true,
        brand: 'Atelier Nord'
      },
      {
        name: 'Merino Wool Minimalist Crewneck',
        description:
          'Soft merino wool crewneck designed for comfortable everyday wear with temperature-regulating and wrinkle-resistant fabric.',
        price: 120,
        discountPrice: 98,
        category: 'Fashion',
        image: '/src/assets/images/cat_fashion_minimal_1790769946284.jpg',
        rating: 4.6,
        numReviews: 27,
        stock: 15,
        featured: false,
        brand: 'Atelier Nord'
      },
      {
        name: 'Structured Japanese Denim Trousers',
        description:
          'Classic straight-leg denim trousers with a structured fit and durable construction for everyday use.',
        price: 185,
        discountPrice: 165,
        category: 'Fashion',
        image: '/src/assets/images/cat_fashion_minimal_1790769946284.jpg',
        rating: 4.9,
        numReviews: 19,
        stock: 14,
        featured: false,
        brand: 'Kuroki Textile'
      },

      // Shoes
      {
        name: 'Vanguard Minimalist Leather Sneakers',
        description:
          'Minimalist leather sneakers designed with a clean silhouette, cushioned footbed, and durable rubber outsole.',
        price: 195,
        discountPrice: 175,
        category: 'Shoes',
        image: '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg',
        rating: 4.9,
        numReviews: 53,
        stock: 19,
        featured: true,
        brand: 'Sole & Craft'
      },
      {
        name: 'Chelsea Lug-Sole Suede Boots',
        description:
          'Classic suede Chelsea boots with elastic side panels and durable lug soles for everyday use.',
        price: 245,
        discountPrice: 215,
        category: 'Shoes',
        image: '/src/assets/images/cat_fashion_minimal_1790769946284.jpg',
        rating: 4.7,
        numReviews: 31,
        stock: 12,
        featured: false,
        brand: 'Sole & Craft'
      },

      // Accessories
      {
        name: 'Handcrafted Leather Bifold Wallet',
        description:
          'Compact full-grain leather bifold wallet with multiple card slots, receipt pockets, and a full-length cash compartment.',
        price: 85,
        discountPrice: 68,
        category: 'Accessories',
        image: '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg',
        rating: 4.8,
        numReviews: 42,
        stock: 30,
        featured: true,
        brand: 'Torino Leather Works'
      },
      {
        name: 'Titanium Chronograph Timepiece',
        description:
          'Modern titanium chronograph watch with a durable case, scratch-resistant crystal, and water-resistant construction.',
        price: 360,
        discountPrice: 320,
        category: 'Accessories',
        image: '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg',
        rating: 4.9,
        numReviews: 38,
        stock: 9,
        featured: true,
        brand: 'Chronos Precision'
      },
      {
        name: 'Polarized Acetate Square Sunglasses',
        description:
          'Classic square-frame sunglasses with polarized lenses and a lightweight acetate frame for everyday outdoor use.',
        price: 135,
        discountPrice: 110,
        category: 'Accessories',
        image: '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg',
        rating: 4.7,
        numReviews: 23,
        stock: 20,
        featured: false,
        brand: 'Optic Archive'
      },

      // Home & Living
      {
        name: 'Sculptural Ceramic Ribbed Floor Vase',
        description:
          'Decorative ceramic floor vase featuring a textured ribbed design and neutral finish for modern interiors.',
        price: 115,
        discountPrice: 89,
        category: 'Home & Living',
        image: '/src/assets/images/cat_home_living_1790769960450.jpg',
        rating: 4.8,
        numReviews: 18,
        stock: 14,
        featured: true,
        brand: 'Terra Living'
      },
      {
        name: 'Brushed Brass Architectural Task Lamp',
        description:
          'Adjustable brass task lamp with a modern design and warm LED lighting for desks, workspaces, and bedside tables.',
        price: 210,
        discountPrice: 185,
        category: 'Home & Living',
        image: '/src/assets/images/cat_home_living_1790769960450.jpg',
        rating: 4.9,
        numReviews: 22,
        stock: 11,
        featured: false,
        brand: 'Lumen Studio'
      },

      // Beauty
      {
        name: 'Botanical Radiance Face Oil',
        description:
          'Lightweight botanical face oil formulated for everyday skincare and moisturizing routines.',
        price: 68,
        discountPrice: 54,
        category: 'Beauty',
        image: '/src/assets/images/cat_home_living_1790769960450.jpg',
        rating: 4.9,
        numReviews: 57,
        stock: 35,
        featured: true,
        brand: 'Aura Botanics'
      },
      {
        name: 'Mineral Purifying Clay Mask',
        description:
          'Clay-based facial mask designed for a simple cleansing and skincare routine.',
        price: 42,
        discountPrice: 35,
        category: 'Beauty',
        image: '/src/assets/images/cat_home_living_1790769960450.jpg',
        rating: 4.7,
        numReviews: 41,
        stock: 28,
        featured: false,
        brand: 'Aura Botanics'
      }
    ];

    const createdProducts = await Product.create(sampleProducts);

    // Create a sample order for the demo customer
    const sampleProduct1 = createdProducts[0];
    const sampleProduct2 = createdProducts[3];

    const product1Price =
      sampleProduct1.discountPrice || sampleProduct1.price;

    const product2Price =
      sampleProduct2.discountPrice || sampleProduct2.price;

    const subtotal = product1Price + product2Price * 2;

    await Order.create({
      user: users[1]._id,

      items: [
        {
          product: sampleProduct1._id,
          name: sampleProduct1.name,
          quantity: 1,
          price: product1Price,
          image: sampleProduct1.image
        },
        {
          product: sampleProduct2._id,
          name: sampleProduct2.name,
          quantity: 2,
          price: product2Price,
          image: sampleProduct2.image
        }
      ],

      shippingAddress: {
        fullName: users[1].name,
        email: users[1].email,
        phone: users[1].phone || '0000000000',
        address: 'Demo Address',
        city: 'Demo City',
        state: 'Demo State',
        postalCode: '000000',
        country: 'India'
      },

      subtotal,
      shippingCost: 0,
      discount: 0,
      totalAmount: subtotal,

      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Processing',

      notes: 'Demo order created for testing.'
    });

    console.log(
      'ShopSphere database seeded successfully with demo users, products, and order.'
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown seeding error';

    console.error('Error during database seed:', message);
  }
};

// Allow manual execution with: npm run seed
if (
  process.argv[1]?.endsWith('seed.ts') ||
  process.argv[1]?.endsWith('seed.js')
) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';

      console.error('Seed process failed:', message);
      process.exitCode = 1;
    } finally {
      await mongoose.connection.close();
    }
  })();
}
```
