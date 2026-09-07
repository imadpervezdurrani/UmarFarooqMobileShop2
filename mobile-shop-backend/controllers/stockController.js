import { StockTransaction } from '../models/StockTransaction.js';
import { Product } from '../models/Product.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getStockTransactions = (req, res) => {
  return sendSuccess(res, StockTransaction.find(), 'Stock history logs');
};

export const getLowStockAlerts = (req, res) => {
  const products = Product.find();
  const lowStock = products.filter((p) => p.stock <= p.minStockLimit);
  return sendSuccess(res, lowStock, 'Low stock products count');
};
