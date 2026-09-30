import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.ts';
import Order from '../models/Order.ts';
import Product from '../models/Product.ts';
import User from '../models/User.ts';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, paymentMethod = 'Cash on Delivery', notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty. Please add items before checking out.' });
      return;
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      res.status(400).json({ success: false, message: 'Please provide all required shipping address fields.' });
      return;
    }

    // Verify stock and compute verified pricing from database
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product || item._id);
      if (!product) {
        res.status(404).json({ success: false, message: `Product "${item.name}" not found.` });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left in stock.`,
        });
        return;
      }

      const itemPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        image: product.image,
      });

      // Reduce product stock
      product.stock -= item.quantity;
      await product.save();
    }

    const shippingCost = subtotal > 100 ? 0 : 10;
    const discount = 0;
    const totalAmount = Math.round((subtotal + shippingCost - discount) * 100) / 100;

    const order = await Order.create({
      user: req.user?._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        email: shippingAddress.email || req.user?.email,
        phone: shippingAddress.phone || req.user?.phone || 'N/A',
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'United States',
      },
      subtotal: Math.round(subtotal * 100) / 100,
      shippingCost,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'Card / Online Payment' ? 'Paid' : 'Pending',
      orderStatus: 'Confirmed',
      notes: notes || '',
    });

    // Clear user cart
    const user = await User.findById(req.user?._id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while processing your order.',
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user?._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your order history.',
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // Check authorization: must be owner or admin
    if (order.user._id.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied: You cannot view this order.' });
      return;
    }

    res.json({
      success: true,
      order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order details.',
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching all orders.',
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (orderStatus === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'Paid';
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully.',
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order status.',
    });
  }
};
