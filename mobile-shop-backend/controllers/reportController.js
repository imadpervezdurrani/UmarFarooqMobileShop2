import store from '../config/db.js';
import { Sale } from '../models/Sale.js';
import { Expense } from '../models/Expense.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Supplier } from '../models/Supplier.js';
import { calculateFinancialSummary } from '../utils/calculateProfit.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getFinancialSummary = (req, res) => {
  const sales = Sale.find();
  const expenses = Expense.find();
  const products = Product.find();

  const summary = calculateFinancialSummary(sales, expenses, products);
  return sendSuccess(res, summary, 'Profit & Loss Statement');
};

export const getDuesReport = (req, res) => {
  const customers = Customer.find().filter((c) => c.remainingCredit > 0);
  const suppliers = Supplier.find().filter((s) => s.amountPayable > 0);

  const customerTotalDues = customers.reduce((sum, c) => sum + (c.remainingCredit || 0), 0);
  const supplierTotalPayable = suppliers.reduce((sum, s) => sum + (s.amountPayable || 0), 0);

  return sendSuccess(
    res,
    {
      customerTotalDues,
      supplierTotalPayable,
      customers,
      suppliers,
    },
    'Dues and Payables Report'
  );
};

export const getOverallDBOverview = (req, res) => {
  const collectionsSummary = {};
  Object.keys(store).forEach((key) => {
    collectionsSummary[key] = {
      count: store[key] ? store[key].length : 0,
      data: store[key] || [],
    };
  });

  return sendSuccess(res, collectionsSummary, 'Overall MongoDB Database Collections Overview');
};
