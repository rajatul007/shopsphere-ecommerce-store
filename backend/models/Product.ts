import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  image: string;
  rating: number;
  numReviews: number;
  stock: number;
  featured: boolean;
  brand?: string;
  specs?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be positive'],
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discount price must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Please specify product category'],
      trim: true,
      enum: ['Electronics', 'Fashion', 'Shoes', 'Accessories', 'Home & Living', 'Beauty'],
    },
    image: {
      type: String,
      required: [true, 'Please provide product image URL'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numReviews: {
      type: Number,
      default: 12,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: String,
      default: 'ShopSphere Atelier',
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
