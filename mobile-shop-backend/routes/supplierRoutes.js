import express from 'express';
import {
  getSuppliers,
  createSupplier,
  recordPayout,
  recordBill,
  getSupplierLedger,
  getSupplierPayablesSummary,
} from '../controllers/supplierController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSuppliers);
router.get('/payables', getSupplierPayablesSummary);
router.get('/:supplierId/ledger', getSupplierLedger);
router.post('/', createSupplier);
router.post('/:id/payout', recordPayout);
router.post('/:id/bill', recordBill);

export default router;
