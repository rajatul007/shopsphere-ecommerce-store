import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.ts';
import { protect, adminOnly } from '../middleware/authMiddleware.ts';

const router = Router();

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

export default router;
