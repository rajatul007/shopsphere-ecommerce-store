import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.ts';
import { protect, adminOnly } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(protect); // All order actions require authentication

router.route('/')
  .post(createOrder)
  .get(getMyOrders);

router.route('/admin/all')
  .get(adminOnly, getAllOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(adminOnly, updateOrderStatus);

export default router;
