import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.ts';
import { protect } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(protect); // All cart actions require authentication

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;
