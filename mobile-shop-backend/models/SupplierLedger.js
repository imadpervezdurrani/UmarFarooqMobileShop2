import store, { saveDB } from '../config/db.js';

export const SupplierLedger = {
  find: () => store.supplier_ledgers || [],

  findBySupplierId: (supplierId) => {
    const list = (store.supplier_ledgers || []).filter((l) => l.supplierId === supplierId);
    return list.sort((a, b) => new Date(a.date) - new Date(b.date) || a.createdAt - b.createdAt);
  },

  findByReference: (referenceId, type) => {
    return (store.supplier_ledgers || []).find(
      (l) => l.referenceId === referenceId && l.type === type
    );
  },

  create: (entry) => {
    if (!store.supplier_ledgers) {
      store.supplier_ledgers = [];
    }

    // Prevent duplicate entries by referenceId & type if referenceId is provided
    if (entry.referenceId && entry.type) {
      const existing = SupplierLedger.findByReference(entry.referenceId, entry.type);
      if (existing) {
        return existing;
      }
    }

    const debit = parseFloat(entry.debit || 0);
    const credit = parseFloat(entry.credit || 0);

    const newLedgerEntry = {
      id: `ledg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      supplierId: entry.supplierId,
      type: entry.type, // 'opening_balance' | 'purchase' | 'payment' | 'purchase_return'
      debit,
      credit,
      description: entry.description || '',
      referenceId: entry.referenceId || '',
      date: entry.date || new Date().toISOString().split('T')[0],
      createdBy: entry.createdBy || 'Admin',
      createdAt: Date.now(),
    };

    store.supplier_ledgers.push(newLedgerEntry);
    saveDB();
    return newLedgerEntry;
  },

  // Calculate full chronological ledger with running balances
  calculateLedgerForSupplier: (supplierId, supplierData) => {
    const rawEntries = SupplierLedger.findBySupplierId(supplierId);

    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;
    let openingBalance = parseFloat(supplierData?.openingBalance || 0);

    // Filter out initial opening balance ledger if present to avoid double counting opening balance
    const openingEntry = rawEntries.find((e) => e.type === 'opening_balance');
    if (openingEntry) {
      openingBalance = openingEntry.credit;
    }

    const transactions = [];

    rawEntries.forEach((tx) => {
      const debit = parseFloat(tx.debit || 0);
      const credit = parseFloat(tx.credit || 0);

      totalDebit += debit;
      totalCredit += credit;

      // Credit increases payable, Debit decreases payable
      runningBalance = runningBalance + credit - debit;

      transactions.push({
        ...tx,
        debit,
        credit,
        runningBalance,
        balance: runningBalance,
        balanceType: runningBalance >= 0 ? 'Cr' : 'Dr',
      });
    });

    const closingPayable = Math.max(0, runningBalance);

    return {
      supplier: supplierData,
      openingBalance,
      totalDebit,
      totalCredit,
      closingPayable,
      transactions,
    };
  },
};
