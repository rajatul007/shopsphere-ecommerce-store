import { Request, Response } from 'express';
import Product from '../models/Product.ts';

// @desc    Fetch all products with filtering, search, and sorting
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, category, minPrice, maxPrice, sort, featured, limit } = req.query;

    const query: any = {};

    // Keyword search across name and description
    if (keyword && typeof keyword === 'string' && keyword.trim() !== '') {
      query.$or = [
        { name: { $regex: keyword.trim(), $options: 'i' } },
        { description: { $regex: keyword.trim(), $options: 'i' } },
        { brand: { $regex: keyword.trim(), $options: 'i' } },
      ];
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'All' && category.trim() !== '') {
      query.category = category.trim();
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1, numReviews: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'name-asc') {
      sortOptions = { name: 1 };
    }

    let productsQuery = Product.find(query).sort(sortOptions);

    if (limit) {
      productsQuery = productsQuery.limit(Number(limit));
    }

    const products = await productsQuery.exec();
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching products.',
    });
  }
};

// @desc    Fetch single product by ID with related products
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found with the specified ID.',
      });
      return;
    }

    // Fetch up to 4 related products in the same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .exec();

    res.json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while retrieving product.',
    });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, discountPrice, category, image, stock, featured, brand } = req.body;

    if (!name || !description || price === undefined || !category || !image) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required product fields: name, description, price, category, image.',
      });
      return;
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      category,
      image,
      stock: stock !== undefined ? Number(stock) : 15,
      featured: Boolean(featured),
      brand: brand || 'ShopSphere Studio',
      rating: 4.8,
      numReviews: 1,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating product.',
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
      return;
    }

    const { name, description, price, discountPrice, category, image, stock, featured, brand } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (category) product.category = category;
    if (image) product.image = image;
    if (stock !== undefined) product.stock = Number(stock);
    if (featured !== undefined) product.featured = Boolean(featured);
    if (brand) product.brand = brand;

    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating product.',
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
      return;
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting product.',
    });
  }
};
