import express from 'express';
import { getStockTransactions, getLowStockAlerts } from '../controllers/stockController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getStockTransactions);
router.get('/low-stock', getLowStockAlerts);

export default router;
