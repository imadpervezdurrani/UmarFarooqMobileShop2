import { Payment } from '../models/Payment.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getPayments = (req, res) => {
  return sendSuccess(res, Payment.find(), 'Payment transaction logs');
};

export const createPayment = (req, res) => {
  const newPayment = Payment.create({
    ...req.body,
    recordedBy: req.user ? req.user.name : 'Admin',
  });
  return sendSuccess(res, newPayment, 'Payment logged successfully', 201);
};
