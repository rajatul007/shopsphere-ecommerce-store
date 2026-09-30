import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.ts';
import User from '../models/User.ts';
import Product from '../models/Product.ts';

// Helper to compute cart totals
const formatCartResponse = async (user: any) => {
  await user.populate('cart.product');

  const validItems: any[] = [];
  let subtotal = 0;

  for (const item of user.cart) {
    if (item.product) {
      const prod = item.product;
      const unitPrice = prod.discountPrice && prod.discountPrice > 0 ? prod.discountPrice : prod.price;
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      validItems.push({
        product: {
          _id: prod._id,
          name: prod.name,
          price: prod.price,
          discountPrice: prod.discountPrice,
          effectivePrice: unitPrice,
          image: prod.image,
          category: prod.category,
          stock: prod.stock,
        },
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }
  }

  // Free shipping over $100, otherwise $10
  const shippingCost = subtotal > 100 || subtotal === 0 ? 0 : 10;
  const total = subtotal + shippingCost;

  return {
    items: validItems,
    totalItems: validItems.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost,
    totalAmount: Math.round(total * 100) / 100,
  };
};

// @desc    Get current user's shopping cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const cartData = await formatCartResponse(user);
    res.json({
      success: true,
      cart: cartData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching cart',
    });
  }
};

// @desc    Add product to cart or increase quantity
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const qty = Math.max(1, Number(quantity));
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    if (product.stock < 1) {
      res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock.' });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const existingIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const newQty = user.cart[existingIndex].quantity + qty;
      user.cart[existingIndex].quantity = Math.min(newQty, product.stock);
    } else {
      user.cart.push({
        product: product._id as any,
        quantity: Math.min(qty, product.stock),
      });
    }

    await user.save();
    const cartData = await formatCartResponse(user);

    res.json({
      success: true,
      message: 'Product added to cart.',
      cart: cartData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding item to cart',
    });
  }
};

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (qty <= 0) {
      // Remove item
      user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        user.cart = user.cart.filter((item) => item.product.toString() !== productId);
      } else {
        const itemIndex = user.cart.findIndex((item) => item.product.toString() === productId);
        if (itemIndex > -1) {
          user.cart[itemIndex].quantity = Math.min(qty, product.stock);
        }
      }
    }

    await user.save();
    const cartData = await formatCartResponse(user);

    res.json({
      success: true,
      message: 'Cart updated.',
      cart: cartData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating cart item',
    });
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    await user.save();

    const cartData = await formatCartResponse(user);

    res.json({
      success: true,
      message: 'Item removed from cart.',
      cart: cartData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing cart item',
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared.',
      cart: {
        items: [],
        totalItems: 0,
        subtotal: 0,
        shippingCost: 0,
        totalAmount: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error clearing cart',
    });
  }
};
