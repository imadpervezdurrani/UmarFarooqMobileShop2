import store, { saveDB } from '../config/db.js';
import { sortByNewest } from '../utils/sortUtils.js';

export const Invoice = {
  find: () => [...store.invoices].sort(sortByNewest),
  findByInvoiceNo: (invNo) => store.invoices.find((i) => i.invoiceNo === invNo),
  createFromSale: (sale) => {
    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: sale.invoiceNo,
      saleId: sale.id,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      grandTotal: sale.grandTotal,
      paidAmount: sale.paidAmount,
      remainingBalance: sale.remainingBalance,
      pdfPath: null,
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.invoices.unshift(newInvoice);
    saveDB();
    return newInvoice;
  },
};
