import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getAdminStats,
} from '../controllers/userController.ts';
import { protect, adminOnly } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.route('/')
  .get(adminOnly, getAllUsers);

router.route('/admin/stats')
  .get(adminOnly, getAdminStats);

export default router;
