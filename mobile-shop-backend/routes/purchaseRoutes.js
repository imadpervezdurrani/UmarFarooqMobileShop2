import express from 'express';
import { getPurchases, createPurchase, updatePurchase, deletePurchase, processPurchaseReturn } from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getPurchases);
router.post('/', createPurchase);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);
router.post('/:id/return', processPurchaseReturn);

export default router;
