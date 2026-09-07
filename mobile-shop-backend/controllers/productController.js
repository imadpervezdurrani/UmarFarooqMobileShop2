import { Product } from '../models/Product.js';
import { StockTransaction } from '../models/StockTransaction.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getProducts = (req, res) => {
  const products = Product.find();
  return sendSuccess(res, products, 'Products retrieved');
};

export const getProductById = (req, res) => {
  const product = Product.findById(req.params.id);
  if (!product) return sendError(res, 'Product not found', 404);
  return sendSuccess(res, product);
};

export const createProduct = (req, res) => {
  try {
    const newProd = Product.create(req.body);

    StockTransaction.create({
      productId: newProd.id,
      productName: `${newProd.brand} ${newProd.model}`,
      imei: newProd.imei1 || 'N/A',
      changeType: 'Initial Stock Add',
      quantity: newProd.stock,
      stockAfter: newProd.stock,
      reference: 'Product Creation',
    });

    return sendSuccess(res, newProd, 'Product created successfully', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateProduct = (req, res) => {
  const updated = Product.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) return sendError(res, 'Product not found', 404);
  return sendSuccess(res, updated, 'Product updated successfully');
};

export const deleteProduct = (req, res) => {
  const deleted = Product.findByIdAndDelete(req.params.id);
  if (!deleted) return sendError(res, 'Product not found', 404);
  return sendSuccess(res, deleted, 'Product deleted successfully');
};
