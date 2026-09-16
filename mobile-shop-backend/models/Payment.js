import store, { saveDB } from '../config/db.js';
import { sortByNewest } from '../utils/sortUtils.js';

export const Payment = {
  find: () => [...store.payments].sort(sortByNewest),
  create: (data) => {
    const newPayment = {
      id: `pay-${Date.now()}`,
      type: data.type, // 'CustomerReceived' | 'SupplierPayout'
      entityId: data.entityId,
      entityName: data.entityName,
      amount: parseFloat(data.amount),
      paymentMethod: data.paymentMethod || 'Cash',
      date: data.date || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      recordedBy: data.recordedBy || 'Admin',
    };
    store.payments.unshift(newPayment);
    saveDB();
    return newPayment;
  },
};
