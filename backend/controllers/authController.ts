import { Response } from 'express';
import User from '../models/User.ts';
import { AuthRequest, generateToken } from '../middleware/authMiddleware.ts';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please verify your password.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user',
    });

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during registration.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during login.',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated.' });
      return;
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile.',
    });
  }
};
