import store, { saveDB } from '../config/db.js';
import { sortByNewest } from '../utils/sortUtils.js';

export const Sale = {
  find: () => {
    return store.sales
      .map((sale) => ({
        ...sale,
        items: store.sale_items.filter((si) => si.saleId === sale.id),
      }))
      .sort(sortByNewest);
  },
  findById: (id) => {
    const sale = store.sales.find((s) => s.id === id);
    if (!sale) return null;
    return {
      ...sale,
      items: store.sale_items.filter((si) => si.saleId === sale.id),
    };
  },
  findByInvoiceNo: (invoiceNo) => {
    const sale = store.sales.find((s) => s.invoiceNo === invoiceNo);
    if (!sale) return null;
    return {
      ...sale,
      items: store.sale_items.filter((si) => si.saleId === sale.id),
    };
  },
  create: (saleData, items) => {
    const count = store.sales.length;
    const invoiceNo = `INV-${1000 + count + 1}`;
    const saleId = `sale-${Date.now()}`;
    const remainingBalance = Math.max(0, saleData.grandTotal - saleData.paidAmount);
    const status = remainingBalance === 0 ? 'Paid' : saleData.paidAmount > 0 ? 'Partial' : 'Unpaid';

    const newSale = {
      id: saleId,
      invoiceNo,
      customerId: saleData.customerId || null,
      customerName: saleData.customerName || 'Walk-in Customer',
      customerPhone: saleData.customerPhone || 'N/A',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subtotal: parseFloat(saleData.subtotal),
      discount: parseFloat(saleData.discount || 0),
      tax: parseFloat(saleData.tax || 0),
      grandTotal: parseFloat(saleData.grandTotal),
      paidAmount: parseFloat(saleData.paidAmount),
      remainingBalance,
      paymentMethod: saleData.paymentMethod || 'Cash',
      salesPerson: saleData.salesPerson || 'Staff',
      status,
    };
    store.sales.unshift(newSale);

    const savedItems = items.map((it, idx) => {
      const prod = store.products.find((p) => p.id === it.productId);
      const itemRecord = {
        id: `si-${Date.now()}-${idx}`,
        saleId,
        productId: it.productId,
        brand: it.brand,
        model: it.model,
        color: it.color || '',
        imei: it.imei || '',
        price: parseFloat(it.price),
        purchaseCost: prod ? prod.purchasePrice : 0,
        quantity: parseInt(it.quantity, 10),
        total: parseFloat(it.price) * parseInt(it.quantity, 10),
      };
      store.sale_items.push(itemRecord);
      return itemRecord;
    });

    saveDB();
    return { ...newSale, items: savedItems };
  },
  refund: (saleId) => {
    const sale = store.sales.find((s) => s.id === saleId);
    if (sale) {
      sale.status = 'Refunded';
      saveDB();
    }
    return sale;
  },
  findByIdAndUpdate: (id, fields) => {
    const idx = store.sales.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    store.sales[idx] = { ...store.sales[idx], ...fields };
    saveDB();
    return {
      ...store.sales[idx],
      items: store.sale_items.filter((si) => si.saleId === id),
    };
  },
  findByIdAndDelete: (id) => {
    const idx = store.sales.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const deleted = store.sales.splice(idx, 1)[0];
    store.sale_items = store.sale_items.filter((si) => si.saleId !== id);
    saveDB();
    return deleted;
  },
};
