import store, { saveDB } from '../config/db.js';
import { sortByNewest } from '../utils/sortUtils.js';

export const Customer = {
  find: () => [...store.customers].sort(sortByNewest),
  findById: (id) => store.customers.find((c) => c.id === id),
  create: (data) => {
    const newCust = {
      id: data.id || `cust-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      address: data.address || '',
      totalPurchases: parseFloat(data.totalPurchases || 0),
      totalPaid: parseFloat(data.totalPaid || 0),
      remainingCredit: parseFloat(data.remainingCredit || 0),
      createdAt: data.createdAt || new Date().toISOString().split('T')[0],
    };
    store.customers.unshift(newCust);
    saveDB();
    return newCust;
  },
  recordSale: (id, grandTotal, paidAmount, remainingBalance) => {
    const cust = store.customers.find((c) => c.id === id);
    if (cust) {
      cust.totalPurchases += parseFloat(grandTotal);
      cust.totalPaid += parseFloat(paidAmount);
      cust.remainingCredit += parseFloat(remainingBalance);
      saveDB();
    }
    return cust;
  },
  recordPayment: (id, amount) => {
    const cust = store.customers.find((c) => c.id === id);
    if (cust) {
      const val = parseFloat(amount);
      cust.totalPaid += val;
      cust.remainingCredit = Math.max(0, cust.remainingCredit - val);
      saveDB();
    }
    return cust;
  },
  findByIdAndUpdate: (id, fields) => {
    const idx = store.customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    store.customers[idx] = { ...store.customers[idx], ...fields };
    saveDB();
    return store.customers[idx];
  },
  findByIdAndDelete: (id) => {
    const idx = store.customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const deleted = store.customers.splice(idx, 1)[0];
    saveDB();
    return deleted;
  },
};
