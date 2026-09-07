import { Category } from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getCategories = (req, res) => {
  return sendSuccess(res, Category.find(), 'Categories retrieved');
};

export const createCategory = (req, res) => {
  try {
    const newCat = Category.create(req.body);
    return sendSuccess(res, newCat, 'Category created', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};
