import { Purchase } from '../models/Purchase.js';
import { Product } from '../models/Product.js';
import { Supplier } from '../models/Supplier.js';
import { StockTransaction } from '../models/StockTransaction.js';
import { SupplierLedger } from '../models/SupplierLedger.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getPurchases = (req, res) => {
  return sendSuccess(res, Purchase.find(), 'Purchases list');
};

export const createPurchase = (req, res) => {
  try {
    const { supplierId, supplierName, items, totalAmount, paidAmount, paymentStatus } = req.body;
    const createdBy = req.user ? req.user.name : 'Admin';

    // 1. Stock Influx & Cost update
    (items || []).forEach((it) => {
      const prod = Product.findById(it.productId);
      if (prod) {
        const newStock = prod.stock + parseInt(it.quantity, 10);
        Product.findByIdAndUpdate(prod.id, {
          stock: newStock,
          purchasePrice: parseFloat(it.purchasePrice),
        });

        StockTransaction.create({
          productId: prod.id,
          productName: it.productName || `${prod.brand} ${prod.model}`,
          imei: it.imei || prod.imei1 || 'N/A',
          changeType: 'Stock Influx (Purchase)',
          quantity: parseInt(it.quantity, 10),
          stockAfter: newStock,
          reference: `PO Influx`,
        });
      }
    });

    // 2. Create Purchase Order
    const newPo = Purchase.create(req.body, items);

    // 3. Supplier Ledger CREDIT & DEBIT Integration
    if (supplierId) {
      Supplier.recordPurchase(
        supplierId,
        parseFloat(totalAmount || 0),
        parseFloat(paidAmount || 0),
        newPo.purchaseNo,
        createdBy
      );
    }

    return sendSuccess(res, newPo, 'Purchase order recorded & stock increased', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const processPurchaseReturn = (req, res) => {
  try {
    const { id } = req.params; // purchase ID
    const { productId, quantity = 1, returnAmount, reason = '' } = req.body;
    const createdBy = req.user ? req.user.name : 'Admin';

    const po = Purchase.findById(id);
    if (!po) return sendError(res, 'Purchase order not found', 404);

    const returnVal = parseFloat(returnAmount || 0);
    if (returnVal <= 0) {
      return sendError(res, 'Please provide a valid positive return amount', 400);
    }

    const returnRef = `RET-${po.purchaseNo}-${productId || 'GEN'}`;

    // Prevent Duplicate Purchase Return
    if (po.supplierId) {
      const existingLedger = SupplierLedger.findByReference(returnRef, 'purchase_return');
      if (existingLedger) {
        return sendError(res, 'This purchase return has already been processed', 400);
      }
    }

    // Deduct stock for returned product
    if (productId) {
      const prod = Product.findById(productId);
      if (prod) {
        const qty = parseInt(quantity, 10) || 1;
        const newStock = Math.max(0, prod.stock - qty);
        Product.findByIdAndUpdate(prod.id, { stock: newStock });

        StockTransaction.create({
          productId: prod.id,
          productName: `${prod.brand} ${prod.model}`,
          imei: prod.imei1 || 'N/A',
          changeType: 'Purchase Return Deduction',
          quantity: -qty,
          stockAfter: newStock,
          reference: `Purchase Return (${po.purchaseNo})`,
        });
      }
    }

    // Record Supplier Ledger DEBIT Entry
    if (po.supplierId) {
      Supplier.recordPurchaseReturn(
        po.supplierId,
        returnVal,
        `Purchase Return ${po.purchaseNo}: ${reason}`,
        returnRef,
        createdBy
      );
    }

    return sendSuccess(res, { purchaseNo: po.purchaseNo, returnAmount: returnVal }, 'Purchase return recorded successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updatePurchase = (req, res) => {
  try {
    const { id } = req.params;
    const po = Purchase.findById(id);
    if (!po) return sendError(res, 'Purchase order not found', 404);

    const { supplierName, totalAmount, paidAmount, paymentStatus, date } = req.body;
    const newTotal = totalAmount !== undefined ? parseFloat(totalAmount) : po.totalAmount;
    const newPaid = paidAmount !== undefined ? parseFloat(paidAmount) : po.paidAmount;
    const remainingPayable = Math.max(0, newTotal - newPaid);

    const updated = Purchase.findByIdAndUpdate(id, {
      ...(supplierName !== undefined && { supplierName }),
      ...(date !== undefined && { date }),
      totalAmount: newTotal,
      paidAmount: newPaid,
      remainingPayable,
      ...(paymentStatus !== undefined ? { paymentStatus } : { paymentStatus: remainingPayable === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid' }),
    });

    return sendSuccess(res, updated, 'Purchase order updated successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deletePurchase = (req, res) => {
  try {
    const { id } = req.params;
    const po = Purchase.findById(id);
    if (!po) return sendError(res, 'Purchase order not found', 404);

    if (po.items && Array.isArray(po.items)) {
      po.items.forEach((it) => {
        const prod = Product.findById(it.productId);
        if (prod) {
          const newStock = Math.max(0, prod.stock - parseInt(it.quantity, 10));
          Product.findByIdAndUpdate(prod.id, { stock: newStock });
          StockTransaction.create({
            productId: prod.id,
            productName: it.productName || `${prod.brand} ${prod.model}`,
            imei: it.imei || prod.imei1 || 'N/A',
            changeType: 'Purchase Deletion Deduction',
            quantity: -parseInt(it.quantity, 10),
            stockAfter: newStock,
            reference: `PO Deleted (${po.purchaseNo})`,
          });
        }
      });
    }

    Purchase.findByIdAndDelete(id);
    return sendSuccess(res, { id, purchaseNo: po.purchaseNo }, 'Purchase order deleted successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
};
