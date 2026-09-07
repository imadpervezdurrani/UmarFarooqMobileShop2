import express from 'express';
import { getInvoices, getInvoiceDetails, getInvoicePDF, sendInvoiceWhatsApp } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow public view of PDF for UltraMsg attachment download & protected endpoints
router.get('/:invoiceNo/pdf', getInvoicePDF);

router.use(protect);

router.get('/', getInvoices);
router.get('/:invoiceNo', getInvoiceDetails);
router.post('/:invoiceNo/send-whatsapp', sendInvoiceWhatsApp);

export default router;
