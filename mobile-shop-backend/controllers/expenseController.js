import { Expense } from '../models/Expense.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getExpenses = (req, res) => {
  return sendSuccess(res, Expense.find(), 'Expenses list');
};

export const createExpense = (req, res) => {
  try {
    const exp = Expense.create({
      ...req.body,
      recordedBy: req.user ? req.user.name : 'Admin',
    });
    return sendSuccess(res, exp, 'Expense logged', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteExpense = (req, res) => {
  const deleted = Expense.findByIdAndDelete(req.params.id);
  if (!deleted) return sendError(res, 'Expense entry not found', 404);
  return sendSuccess(res, deleted, 'Expense entry deleted');
};
