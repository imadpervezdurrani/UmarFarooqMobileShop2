import { Sale } from '../models/Sale.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Invoice } from '../models/Invoice.js';
import { StockTransaction } from '../models/StockTransaction.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getSales = (req, res) => {
  return sendSuccess(res, Sale.find(), 'Sales list');
};

export const createSale = (req, res) => {
  try {
    const { items, customerId, customerName, grandTotal, paidAmount } = req.body;

    // 1. Verify and deduct stock
    for (const item of items) {
      const prod = Product.findById(item.productId);
      if (!prod || prod.stock < item.quantity) {
        return sendError(res, `Insufficient stock for ${item.brand} ${item.model}`, 400);
      }
    }

    // Deduct stock & log transaction
    items.forEach((item) => {
      const prod = Product.findById(item.productId);
      const newStock = prod.stock - item.quantity;
      Product.findByIdAndUpdate(prod.id, { stock: newStock });

      StockTransaction.create({
        productId: prod.id,
        productName: `${prod.brand} ${prod.model}`,
        imei: item.imei || prod.imei1 || 'N/A',
        changeType: 'Deduction (Sale)',
        quantity: -item.quantity,
        stockAfter: newStock,
        reference: `POS Sale`,
      });
    });

    // 2. Create Sale Record
    const newSale = Sale.create(
      {
        ...req.body,
        salesPerson: req.user ? req.user.name : 'Staff',
      },
      items
    );

    // 3. Create Invoice Master
    Invoice.createFromSale(newSale);

    // 4. Update Customer Ledger if registered
    if (customerId) {
      Customer.recordSale(customerId, grandTotal, paidAmount, newSale.remainingBalance);
    }

    return sendSuccess(res, newSale, `Invoice ${newSale.invoiceNo} created successfully`, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const refundSale = (req, res) => {
  try {
    const { id } = req.params;
    const { productId, refundQty } = req.body || {};

    const sale = Sale.findById(id);
    if (!sale) return sendError(res, 'Sale invoice not found', 404);

    if (sale.status === 'Refunded') {
      return sendError(res, 'This invoice is already marked as Refunded', 400);
    }

    if (productId) {
      const item = (sale.items || []).find((it) => it.productId === productId);
      if (!item) return sendError(res, 'Item not found in sale invoice', 404);

      const qty = parseInt(refundQty, 10) || 1;
      const prod = Product.findById(productId);
      if (prod) {
        const restoredStock = prod.stock + qty;
        Product.findByIdAndUpdate(prod.id, { stock: restoredStock });

        StockTransaction.create({
          productId: prod.id,
          productName: `${prod.brand} ${prod.model}`,
          imei: item.imei || 'N/A',
          changeType: 'Restock (Refund)',
          quantity: qty,
          stockAfter: restoredStock,
          reference: `Refund on #${sale.invoiceNo}`,
        });
      }
    } else {
      // Full invoice refund: restore ALL items on the invoice back to inventory!
      (sale.items || []).forEach((item) => {
        const prod = Product.findById(item.productId);
        if (prod) {
          const qty = parseInt(item.quantity, 10) || 1;
          const restoredStock = prod.stock + qty;
          Product.findByIdAndUpdate(prod.id, { stock: restoredStock });

          StockTransaction.create({
            productId: prod.id,
            productName: `${prod.brand} ${prod.model}`,
            imei: item.imei || prod.imei1 || 'N/A',
            changeType: 'Restock (Refund)',
            quantity: qty,
            stockAfter: restoredStock,
            reference: `Refund on #${sale.invoiceNo}`,
          });
        }
      });
    }

    Sale.refund(id);

    if (sale.customerId && sale.remainingBalance > 0) {
      Customer.recordPayment(sale.customerId, sale.remainingBalance);
    }

    return sendSuccess(res, { saleId: id }, `Refund processed & inventory restored for Invoice ${sale.invoiceNo}`);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateSale = (req, res) => {
  try {
    const { id } = req.params;
    const sale = Sale.findById(id);
    if (!sale) return sendError(res, 'Sale invoice not found', 404);

    const { customerName, customerPhone, paymentMethod, paidAmount, grandTotal, status } = req.body;
    const newGrandTotal = grandTotal !== undefined ? parseFloat(grandTotal) : sale.grandTotal;
    const newPaidAmount = paidAmount !== undefined ? parseFloat(paidAmount) : sale.paidAmount;
    const remainingBalance = Math.max(0, newGrandTotal - newPaidAmount);

    // If status changed to 'Refunded', restore all items to product inventory
    if (status === 'Refunded' && sale.status !== 'Refunded') {
      (sale.items || []).forEach((item) => {
        const prod = Product.findById(item.productId);
        if (prod) {
          const qty = parseInt(item.quantity, 10) || 1;
          const restoredStock = prod.stock + qty;
          Product.findByIdAndUpdate(prod.id, { stock: restoredStock });

          StockTransaction.create({
            productId: prod.id,
            productName: `${prod.brand} ${prod.model}`,
            imei: item.imei || prod.imei1 || 'N/A',
            changeType: 'Restock (Refund)',
            quantity: qty,
            stockAfter: restoredStock,
            reference: `Refund Status on #${sale.invoiceNo}`,
          });
        }
      });

      if (sale.customerId && sale.remainingBalance > 0) {
        Customer.recordPayment(sale.customerId, sale.remainingBalance);
      }
    }

    // If status changed from 'Refunded' back to active, re-deduct stock
    if (status && status !== 'Refunded' && sale.status === 'Refunded') {
      (sale.items || []).forEach((item) => {
        const prod = Product.findById(item.productId);
        if (prod) {
          const qty = parseInt(item.quantity, 10) || 1;
          const deductedStock = Math.max(0, prod.stock - qty);
          Product.findByIdAndUpdate(prod.id, { stock: deductedStock });

          StockTransaction.create({
            productId: prod.id,
            productName: `${prod.brand} ${prod.model}`,
            imei: item.imei || prod.imei1 || 'N/A',
            changeType: 'Deduction (Reopened Sale)',
            quantity: -qty,
            stockAfter: deductedStock,
            reference: `Reopened Invoice #${sale.invoiceNo}`,
          });
        }
      });
    }

    const updated = Sale.findByIdAndUpdate(id, {
      ...(customerName !== undefined && { customerName }),
      ...(customerPhone !== undefined && { customerPhone }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      grandTotal: newGrandTotal,
      paidAmount: newPaidAmount,
      remainingBalance,
      ...(status !== undefined ? { status } : { status: remainingBalance === 0 ? 'Paid' : newPaidAmount > 0 ? 'Partial' : 'Unpaid' }),
    });

    return sendSuccess(res, updated, 'Sale invoice updated successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteSale = (req, res) => {
  try {
    const { id } = req.params;
    const { restock = true } = req.body || {};
    const sale = Sale.findById(id);
    if (!sale) return sendError(res, 'Sale invoice not found', 404);

    // If restock is requested, restore inventory
    if (restock && sale.items && Array.isArray(sale.items)) {
      sale.items.forEach((it) => {
        const prod = Product.findById(it.productId);
        if (prod) {
          const newStock = prod.stock + parseInt(it.quantity, 10);
          Product.findByIdAndUpdate(prod.id, { stock: newStock });
          StockTransaction.create({
            productId: prod.id,
            productName: `${prod.brand} ${prod.model}`,
            imei: it.imei || prod.imei1 || 'N/A',
            changeType: 'Restock (Sale Deletion)',
            quantity: parseInt(it.quantity, 10),
            stockAfter: newStock,
            reference: `Sale Deleted (${sale.invoiceNo})`,
          });
        }
      });
    }

    // If customer had balance recorded for this sale, adjust customer dues
    if (sale.customerId && sale.remainingBalance > 0) {
      const cust = Customer.findById(sale.customerId);
      if (cust) {
        Customer.findByIdAndUpdate(sale.customerId, {
          remainingCredit: Math.max(0, (cust.remainingCredit || cust.dues || 0) - sale.remainingBalance),
        });
      }
    }

    Sale.findByIdAndDelete(id);
    return sendSuccess(res, { id, invoiceNo: sale.invoiceNo }, 'Sale invoice deleted successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
};
