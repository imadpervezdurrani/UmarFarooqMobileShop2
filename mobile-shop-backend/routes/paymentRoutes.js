import express from 'express';
import { getPayments, createPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getPayments);
router.post('/', createPayment);

export default router;
