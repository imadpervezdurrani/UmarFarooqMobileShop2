import express from 'express';
import { getFinancialSummary, getDuesReport, getOverallDBOverview } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/pnl', authorize('admin'), getFinancialSummary);
router.get('/dues', getDuesReport);
router.get('/overview', getOverallDBOverview);

export default router;
