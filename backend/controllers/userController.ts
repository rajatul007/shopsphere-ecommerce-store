import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.ts';
import User from '../models/User.ts';
import Order from '../models/Order.ts';
import Product from '../models/Product.ts';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile.',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { name, email, phone, address, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (address) {
      user.address = {
        address: address.address ?? user.address?.address ?? '',
        city: address.city ?? user.address?.city ?? '',
        state: address.state ?? user.address?.state ?? '',
        postalCode: address.postalCode ?? user.address?.postalCode ?? '',
        country: address.country ?? user.address?.country ?? 'United States',
      };
    }
    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user profile.',
    });
  }
};

// @desc    Get all registered users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users list.',
    });
  }
};

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/users/admin/stats
// @access  Private/Admin
export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue from all non-cancelled orders
    const orders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
    const totalSales = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales: Math.round(totalSales * 100) / 100,
        pendingOrders,
        lowStockProducts,
      },
      recentOrders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating admin statistics.',
    });
  }
};
