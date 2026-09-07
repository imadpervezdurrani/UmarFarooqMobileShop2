import { Supplier } from '../models/Supplier.js';
import { SupplierLedger } from '../models/SupplierLedger.js';
import { Payment } from '../models/Payment.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getSuppliers = (req, res) => {
  const suppliers = Supplier.find();
  const list = suppliers.map((s) => {
    const ledgerCalc = SupplierLedger.calculateLedgerForSupplier(s.id, s);
    return {
      ...s,
      openingBalance: ledgerCalc.openingBalance,
      totalDebit: ledgerCalc.totalDebit,
      totalCredit: ledgerCalc.totalCredit,
      amountPayable: ledgerCalc.closingPayable,
    };
  });
  return sendSuccess(res, list, 'Suppliers list');
};

export const getSupplierPayablesSummary = (req, res) => {
  const suppliers = Supplier.find();
  const summary = suppliers.map((s) => {
    const ledgerCalc = SupplierLedger.calculateLedgerForSupplier(s.id, s);
    return {
      supplier: {
        _id: s.id,
        id: s.id,
        name: s.name,
        phone: s.phone,
      },
      openingBalance: ledgerCalc.openingBalance,
      totalDebit: ledgerCalc.totalDebit,
      totalCredit: ledgerCalc.totalCredit,
      payable: ledgerCalc.closingPayable,
    };
  });
  return sendSuccess(res, summary, 'Supplier Payables Summary');
};

export const getSupplierLedger = (req, res) => {
  const { supplierId } = req.params;
  const supp = Supplier.findById(supplierId);
  if (!supp) return sendError(res, 'Supplier not found', 404);

  const ledgerData = SupplierLedger.calculateLedgerForSupplier(supplierId, supp);
  return sendSuccess(res, ledgerData, `Supplier ledger for ${supp.name}`);
};

export const createSupplier = (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return sendError(res, 'Supplier name and phone number are required', 400);
    }
    const supp = Supplier.create(req.body);
    return sendSuccess(res, supp, 'Supplier created successfully', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const recordPayout = (req, res) => {
  const { id } = req.params;
  const { amount, notes } = req.body;

  const val = parseFloat(amount);
  if (isNaN(val) || val <= 0) {
    return sendError(res, 'Please provide a valid positive payment amount', 400);
  }

  const supp = Supplier.findById(id);
  if (!supp) return sendError(res, 'Supplier not found', 404);

  const ledgerCalc = SupplierLedger.calculateLedgerForSupplier(id, supp);
  const currentPayable = ledgerCalc.closingPayable;

  // Prevent payment from exceeding current payable unless advance payment is supported
  if (val > currentPayable && currentPayable > 0) {
    console.warn(`Payment of ${val} exceeds current payable of ${currentPayable}`);
  }

  const createdBy = req.user ? req.user.name : 'Admin';
  const payRef = `PAY-${Date.now()}`;

  // Record Payment model log
  const paymentRecord = Payment.create({
    type: 'SupplierPayout',
    entityId: supp.id,
    entityName: supp.name,
    amount: val,
    notes,
    recordedBy: createdBy,
  });

  // Record Ledger DEBIT Entry
  Supplier.recordPayout(id, val, notes, paymentRecord.id, createdBy);

  const updatedLedger = SupplierLedger.calculateLedgerForSupplier(id, supp);

  return sendSuccess(res, updatedLedger, `Payout of ${val} recorded for ${supp.name}`);
};

export const recordBill = (req, res) => {
  const { id } = req.params;
  const { totalAmount, paidAmount = 0, notes = '' } = req.body;

  const total = parseFloat(totalAmount) || 0;
  const paid = parseFloat(paidAmount) || 0;

  if (total <= 0) {
    return sendError(res, 'Please provide a valid bill total amount', 400);
  }

  const supp = Supplier.findById(id);
  if (!supp) return sendError(res, 'Supplier not found', 404);

  const createdBy = req.user ? req.user.name : 'Admin';
  const billRef = `BILL-${Date.now()}`;

  Supplier.recordPurchase(id, total, paid, billRef, createdBy);

  const updatedLedger = SupplierLedger.calculateLedgerForSupplier(id, supp);

  return sendSuccess(res, updatedLedger, `Stock bill of ${total} recorded for ${supp.name}`);
};
