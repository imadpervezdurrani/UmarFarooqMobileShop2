import store, { saveDB } from '../config/db.js';
import { sortByNewest } from '../utils/sortUtils.js';

export const StockTransaction = {
  find: () => [...store.stock_transactions].sort(sortByNewest),
  create: (data) => {
    const newTx = {
      id: `sh-${Date.now()}-${data.productId || ''}`,
      date: data.date || new Date().toISOString().split('T')[0],
      productId: data.productId,
      productName: data.productName,
      imei: data.imei || 'N/A',
      changeType: data.changeType, // 'Initial Stock' | 'Deduction (Sale)' | 'Stock Influx (Purchase)' | 'Restock (Refund)'
      quantity: parseInt(data.quantity, 10),
      stockAfter: parseInt(data.stockAfter, 10),
      reference: data.reference,
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.stock_transactions.unshift(newTx);
    saveDB();
    return newTx;
  },
};
