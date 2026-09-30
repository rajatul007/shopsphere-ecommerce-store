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

    if (userCount > 0 && productCount > 0) {
      console.log('Database already contains records. Skipping seed.');
      return;
    }

    console.log('Seeding initial ShopSphere database records...');

    // Clear existing
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Pass plaintext passwords - UserSchema pre-save hook will automatically hash them
    const users = await User.create([
      {
        name: 'ShopSphere Admin',
        email: 'admin@shopsphere.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1 (555) 019-2834',
        address: {
          address: '742 Evergreen Promenade, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94107',
          country: 'United States',
        },
      },
      {
        name: 'Alex Morgan',
        email: 'alex@shopsphere.com',
        password: 'user123',
        role: 'user',
        phone: '+1 (555) 837-1920',
        address: {
          address: '415 Mission Street, Apt 12B',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'United States',
        },
      },
    ]);

    const sampleProducts = [
      // Electronics
      {
        name: 'AcousticPro Wireless Studio Headphones',
        description: 'Engineered with custom 45mm neodymium drivers, active noise cancellation, and up to 40 hours of playback. Features memory foam acoustic earcups and low-latency Bluetooth 5.4 connectivity for studio-grade audio precision.',
        price: 289,
        discountPrice: 249,
        category: 'Electronics',
        image: '/src/assets/images/cat_electronics_audio_1790769932114.jpg',
        rating: 4.9,
        numReviews: 48,
        stock: 18,
        featured: true,
        brand: 'SoundCraft Acoustic',
      },
      {
        name: 'UltraWide Curved 34-inch Studio Display',
        description: 'IPS Black panel offering 98% DCI-P3 color accuracy, 120Hz refresh rate, and Thunderbolt 4 90W power delivery. Ideal for high-throughput software development and color-critical media production.',
        price: 749,
        discountPrice: 699,
        category: 'Electronics',
        image: '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg',
        rating: 4.8,
        numReviews: 29,
        stock: 8,
        featured: true,
        brand: 'Horizon Vision',
      },
      {
        name: 'Mechanical Tactile Low-Profile Keyboard',
        description: 'Aircraft-grade anodized aluminum body featuring custom lubricated mechanical switches, PBT keycaps, and multi-device wireless pairing via 2.4GHz and Bluetooth.',
        price: 159,
        discountPrice: 139,
        category: 'Electronics',
        image: '/src/assets/images/cat_electronics_audio_1790769932114.jpg',
        rating: 4.7,
        numReviews: 64,
        stock: 25,
        featured: false,
        brand: 'KeySmith Works',
      },

      // Fashion
      {
        name: 'Tailored Raw Linen Overshirt',
        description: 'Woven from 100% French organic flax linen. Relaxed European tailoring with horn buttons, dual chest flap pockets, and reinforced flat-felled seams. Highly breathable and structured for all seasons.',
        price: 145,
        discountPrice: 119,
        category: 'Fashion',
        image: '/src/assets/images/cat_fashion_minimal_1790769946284.jpg',
        rating: 4.8,
        numReviews: 34,
        stock: 22,
        featured: true,
        brand: 'Atelier Nord',
      },
      {
        name: 'Merino Wool Minimalist Crewneck',
        description: 'Crafted from 19.5 micron superfine Australian merino wool. Naturally temperature-regulating, wrinkle-resistant, and ultra-soft against the skin with ribbed collar and cuffs.',
        price: 120,
        discountPrice: 98,
        category: 'Fashion',
        image: '/src/assets/images/cat_fashion_minimal_1790769946284.jpg',
        rating: 4.6,
        numReviews: 27,
        stock: 15,
        featured: false,
        brand: 'Atelier Nord',
      },
      {
        name: 'Structured Japanese Denim Trousers',
        description: 'Custom 13.5oz ring-spun denim sourced from Okayama mills. Classic straight-leg silhouette with copper rivets and natural indigo wash that develops unique patina over time.',
        price: 185,
        discountPrice: 165,
        category: 'Fashion',
        image: '/src/assets/images/cat_fashion_minimal_1790769946284.jpg',
        rating: 4.9,
        numReviews: 19,
        stock: 14,
        featured: false,
        brand: 'Kuroki Textile',
      },

      // Shoes
      {
        name: 'Vanguard Minimalist Leather Sneakers',
        description: 'Hand-stitched in Portugal using full-grain Italian calfskin leather and Margom vulcanized rubber outsoles. Calfskin lining and cushioned dual-density cork footbed for all-day comfort.',
        price: 195,
        discountPrice: 175,
        category: 'Shoes',
        image: '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg',
        rating: 4.9,
        numReviews: 53,
        stock: 19,
        featured: true,
        brand: 'Sole & Craft',
      },
      {
        name: 'Chelsea Lug-Sole Suede Boots',
        description: 'Weatherproof treated Tuscan suede with elasticated side gussets and lightweight Vibram lug soles. Goodyear welted construction built for years of durability.',
        price: 245,
        discountPrice: 215,
        category: 'Shoes',
        image: '/src/assets/images/cat_fashion_minimal_1790769946284.jpg',
        rating: 4.7,
        numReviews: 31,
        stock: 12,
        featured: false,
        brand: 'Sole & Craft',
      },

      // Accessories
      {
        name: 'Handcrafted Vegetable-Tanned Bifold Wallet',
        description: 'Full-grain Tuscan vegetable-tanned leather hand-burnished with natural beeswax. Features 6 card slots, dual receipt pockets, and a lined full-length cash compartment.',
        price: 85,
        discountPrice: 68,
        category: 'Accessories',
        image: '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg',
        rating: 4.8,
        numReviews: 42,
        stock: 30,
        featured: true,
        brand: 'Torino Leather Works',
      },
      {
        name: 'Titanium Chronograph Sapphire Timepiece',
        description: 'Solid Grade 2 titanium case with antireflective sapphire crystal and Japanese Mecha-Quartz movement. 50m water resistance with integrated quick-release FKM rubber strap.',
        price: 360,
        discountPrice: 320,
        category: 'Accessories',
        image: '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg',
        rating: 4.9,
        numReviews: 38,
        stock: 9,
        featured: true,
        brand: 'Chronos Precision',
      },
      {
        name: 'Polarized Acetate Square Sunglasses',
        description: 'Handcrafted cellulose acetate frames with custom barrel hinges and scratch-resistant polarized Category 3 lenses providing 100% UVA/UVB protection.',
        price: 135,
        discountPrice: 110,
        category: 'Accessories',
        image: '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg',
        rating: 4.7,
        numReviews: 23,
        stock: 20,
        featured: false,
        brand: 'Optic Archive',
      },

      // Home & Living
      {
        name: 'Sculptural Ceramic Ribbed Floor Vase',
        description: 'Hand-thrown stoneware clay with matte mineral chalk glaze. Distinctive architectural fluting makes it an eye-catching focal sculpture for living spaces and foyers.',
        price: 115,
        discountPrice: 89,
        category: 'Home & Living',
        image: '/src/assets/images/cat_home_living_1790769960450.jpg',
        rating: 4.8,
        numReviews: 18,
        stock: 14,
        featured: true,
        brand: 'Terra Living',
      },
      {
        name: 'Brushed Brass Architectural Task Lamp',
        description: 'Solid spun brass with dual pivoting counter-weighted arms and integrated warm 2700K dimmable LED. Provides glare-free directional lighting for work desks and bedside tables.',
        price: 210,
        discountPrice: 185,
        category: 'Home & Living',
        image: '/src/assets/images/cat_home_living_1790769960450.jpg',
        rating: 4.9,
        numReviews: 22,
        stock: 11,
        featured: false,
        brand: 'Lumen Studio',
      },

      // Beauty
      {
        name: 'Botanical Radiance Nutrient Face Oil',
        description: 'Cold-pressed organic rosehip, squalane, and marula oils infused with botanical vitamin C. Restores lipid moisture barrier and delivers glowing hydration without clogging pores.',
        price: 68,
        discountPrice: 54,
        category: 'Beauty',
        image: '/src/assets/images/cat_home_living_1790769960450.jpg',
        rating: 4.9,
        numReviews: 57,
        stock: 35,
        featured: true,
        brand: 'Aura Botanics',
      },
      {
        name: 'Mineral Purifying Clay Exfoliating Mask',
        description: 'Formulated with French green clay, salicylic acid, and soothing chamomile extract to gently unclog pores, absorb excess oil, and refine skin texture.',
        price: 42,
        discountPrice: 35,
        category: 'Beauty',
        image: '/src/assets/images/cat_home_living_1790769960450.jpg',
        rating: 4.7,
        numReviews: 41,
        stock: 28,
        featured: false,
        brand: 'Aura Botanics',
      },
    ];

    const createdProducts = await Product.create(sampleProducts);

    // Create an initial sample order for the demo user
    const sampleProduct1 = createdProducts[0];
    const sampleProduct2 = createdProducts[3];

    await Order.create({
      user: users[1]._id,
      items: [
        {
          product: sampleProduct1._id,
          name: sampleProduct1.name,
          quantity: 1,
          price: sampleProduct1.discountPrice || sampleProduct1.price,
          image: sampleProduct1.image,
        },
        {
          product: sampleProduct2._id,
          name: sampleProduct2.name,
          quantity: 2,
          price: sampleProduct2.discountPrice || sampleProduct2.price,
          image: sampleProduct2.image,
        },
      ],
      shippingAddress: {
        fullName: users[1].name,
        email: users[1].email,
        phone: users[1].phone || '+1 (555) 837-1920',
        address: '415 Mission Street, Apt 12B',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'United States',
      },
      subtotal: (sampleProduct1.discountPrice || sampleProduct1.price) + (sampleProduct2.discountPrice || sampleProduct2.price) * 2,
      shippingCost: 0,
      discount: 0,
      totalAmount: (sampleProduct1.discountPrice || sampleProduct1.price) + (sampleProduct2.discountPrice || sampleProduct2.price) * 2,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      notes: 'Please ring the doorbell upon arrival.',
    });

    console.log('Database successfully seeded with realistic products, users, and orders.');
  } catch (error: any) {
    console.error('Error during database seed:', error.message);
  }
};

// If run directly via command line
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  })();
}
