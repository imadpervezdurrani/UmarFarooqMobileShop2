import store, { saveDB } from '../config/db.js';
import { SupplierLedger } from './SupplierLedger.js';

export const Supplier = {
  find: () => store.suppliers,
  findById: (id) => store.suppliers.find((s) => s.id === id),

  create: (data) => {
    const openingBalance = parseFloat(data.openingBalance || data.amountPayable || 0);
    const newSupp = {
      id: data.id || `supp-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      address: data.address || '',
      openingBalance,
      totalPurchases: parseFloat(data.totalPurchases || 0),
      totalPayments: parseFloat(data.totalPayments || data.amountPaid || 0),
      totalPurchaseReturns: parseFloat(data.totalPurchaseReturns || 0),
      amountPaid: parseFloat(data.totalPayments || data.amountPaid || 0),
      amountPayable: openingBalance,
      createdAt: data.createdAt || new Date().toISOString().split('T')[0],
    };

    store.suppliers.unshift(newSupp);
    saveDB();

    // Create Opening Balance CREDIT entry in SupplierLedger if openingBalance > 0
    if (openingBalance > 0) {
      SupplierLedger.create({
        supplierId: newSupp.id,
        type: 'opening_balance',
        debit: 0,
        credit: openingBalance,
        description: 'Opening Payable Balance',
        referenceId: `OPEN-${newSupp.id}`,
        date: newSupp.createdAt,
      });
    }

    return newSupp;
  },

  recordPurchase: (id, totalAmount, paidAmount, referenceId, createdBy = 'Admin') => {
    const supp = store.suppliers.find((s) => s.id === id);
    const total = parseFloat(totalAmount || 0);
    const paid = parseFloat(paidAmount || 0);

    if (supp) {
      supp.totalPurchases = (supp.totalPurchases || 0) + total;
      supp.amountPaid = (supp.amountPaid || 0) + paid;
      supp.totalPayments = supp.amountPaid;
      saveDB();
    }

    // 1. Ledger CREDIT Entry for Purchase Total
    if (total > 0) {
      SupplierLedger.create({
        supplierId: id,
        type: 'purchase',
        debit: 0,
        credit: total,
        description: `Stock Purchase ${referenceId ? `(${referenceId})` : ''}`,
        referenceId: referenceId || `PUR-${Date.now()}`,
        createdBy,
      });
    }

    // 2. Ledger DEBIT Entry if payment was made on purchase spot
    if (paid > 0) {
      SupplierLedger.create({
        supplierId: id,
        type: 'payment',
        debit: paid,
        credit: 0,
        description: `Payment on spot for Purchase ${referenceId ? `(${referenceId})` : ''}`,
        referenceId: `PAY-${referenceId || Date.now()}`,
        createdBy,
      });
    }

    return supp;
  },

  recordPayout: (id, amount, notes = '', referenceId = '', createdBy = 'Admin') => {
    const supp = store.suppliers.find((s) => s.id === id);
    const val = parseFloat(amount || 0);

    if (supp) {
      supp.amountPaid = (supp.amountPaid || 0) + val;
      supp.totalPayments = supp.amountPaid;
      saveDB();
    }

    // Ledger DEBIT Entry for Supplier Payment
    SupplierLedger.create({
      supplierId: id,
      type: 'payment',
      debit: val,
      credit: 0,
      description: notes ? `Payment to supplier: ${notes}` : 'Supplier Account Payment Settlement',
      referenceId: referenceId || `PAY-${Date.now()}`,
      createdBy,
    });

    return supp;
  },

  recordPurchaseReturn: (id, returnAmount, notes = '', referenceId = '', createdBy = 'Admin') => {
    const supp = store.suppliers.find((s) => s.id === id);
    const val = parseFloat(returnAmount || 0);

    if (supp) {
      supp.totalPurchaseReturns = (supp.totalPurchaseReturns || 0) + val;
      saveDB();
    }

    // Ledger DEBIT Entry for Purchase Return
    SupplierLedger.create({
      supplierId: id,
      type: 'purchase_return',
      debit: val,
      credit: 0,
      description: notes ? `Purchase Return: ${notes}` : 'Purchase Return Dues Credit',
      referenceId: referenceId || `RET-${Date.now()}`,
      createdBy,
    });

    return supp;
  },
};
