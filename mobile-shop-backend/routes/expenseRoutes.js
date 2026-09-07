import express from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', authorize('admin'), deleteExpense);

export default router;
