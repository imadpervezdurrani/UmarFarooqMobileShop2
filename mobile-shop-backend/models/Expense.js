import store, { saveDB } from '../config/db.js';

export const Expense = {
  find: () => store.expenses,
  findById: (id) => store.expenses.find((e) => e.id === id),
  create: (data) => {
    const newExp = {
      id: `exp-${Date.now()}`,
      category: data.category,
      amount: parseFloat(data.amount),
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || '',
      recordedBy: data.recordedBy || 'Admin',
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.expenses.unshift(newExp);
    saveDB();
    return newExp;
  },
  findByIdAndDelete: (id) => {
    const idx = store.expenses.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const deleted = store.expenses.splice(idx, 1)[0];
    saveDB();
    return deleted;
  },
};
