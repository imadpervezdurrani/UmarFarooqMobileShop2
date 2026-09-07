import express from 'express';
import { getSales, createSale, updateSale, deleteSale, refundSale } from '../controllers/saleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSales);
router.post('/', createSale);
router.put('/:id', updateSale);
router.delete('/:id', deleteSale);
router.post('/:id/refund', authorize('admin'), refundSale);

export default router;
