import { Invoice } from '../models/Invoice.js';
import { Sale } from '../models/Sale.js';
import { formatInvoicePayload } from '../utils/generateInvoice.js';
import { sendWhatsAppPDFInvoice } from '../utils/whatsapp.js';
import { generateInvoicePDFBuffer } from '../utils/pdfGenerator.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getInvoices = (req, res) => {
  return sendSuccess(res, Invoice.find(), 'Invoices list');
};

export const getInvoiceDetails = (req, res) => {
  const { invoiceNo } = req.params;
  const sale = Sale.findByInvoiceNo(invoiceNo);
  if (!sale) return sendError(res, 'Invoice not found', 404);

  const formatted = formatInvoicePayload(sale);
  return sendSuccess(res, formatted, `Invoice details for ${invoiceNo}`);
};

export const getInvoicePDF = async (req, res) => {
  try {
    const { invoiceNo } = req.params;
    const sale = Sale.findByInvoiceNo(invoiceNo);
    if (!sale) return sendError(res, 'Invoice not found', 404);

    const pdfBuffer = await generateInvoicePDFBuffer(sale);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Invoice-${invoiceNo}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const sendInvoiceWhatsApp = async (req, res) => {
  try {
    const { invoiceNo } = req.params;
    const { phone } = req.body;

    const sale = Sale.findByInvoiceNo(invoiceNo);
    if (!sale) return sendError(res, 'Sale invoice not found', 404);

    const targetPhone = phone || sale.customerPhone;
    if (!targetPhone) {
      return sendError(res, 'Customer phone number is missing', 400);
    }

    // Generate PDF Buffer and convert to Base64 data string
    const pdfBuffer = await generateInvoicePDFBuffer(sale);
    const pdfBase64 = pdfBuffer.toString('base64');

    const result = await sendWhatsAppPDFInvoice({
      phone: targetPhone,
      invoiceNo: sale.invoiceNo,
      customerName: sale.customerName,
      grandTotal: sale.grandTotal,
      pdfBase64,
      storeName: 'Umar Farooq Mobile Zone',
    });

    return sendSuccess(res, result, `Direct PDF Invoice ${sale.invoiceNo} dispatched to ${result.phone} via UltraMsg WhatsApp API`);
  } catch (err) {
    return sendError(res, err.message);
  }
};
