import express from 'express';
import { getCategories, createCategory } from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCategories);
router.post('/', createCategory);

export default router;
