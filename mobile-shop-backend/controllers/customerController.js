import { Customer } from '../models/Customer.js';
import { Payment } from '../models/Payment.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getCustomers = (req, res) => {
  return sendSuccess(res, Customer.find(), 'Customers list');
};

export const createCustomer = (req, res) => {
  try {
    const cust = Customer.create(req.body);
    return sendSuccess(res, cust, 'Customer created', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const recordPayment = (req, res) => {
  const { id } = req.params;
  const { amount, notes } = req.body;
  const cust = Customer.recordPayment(id, amount);
  if (!cust) return sendError(res, 'Customer not found', 404);

  Payment.create({
    type: 'CustomerReceived',
    entityId: cust.id,
    entityName: cust.name,
    amount,
    notes,
    recordedBy: req.user ? req.user.name : 'Admin',
  });

  return sendSuccess(res, cust, `Payment of ${amount} recorded for ${cust.name}`);
};

export const updateCustomer = (req, res) => {
  try {
    const { id } = req.params;
    const cust = Customer.findById(id);
    if (!cust) return sendError(res, 'Customer not found', 404);

    const { name, phone, address, remainingCredit } = req.body;
    const updated = Customer.findByIdAndUpdate(id, {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(remainingCredit !== undefined && { remainingCredit: parseFloat(remainingCredit) }),
    });

    return sendSuccess(res, updated, 'Customer profile & dues updated successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteCustomer = (req, res) => {
  try {
    const { id } = req.params;
    const cust = Customer.findById(id);
    if (!cust) return sendError(res, 'Customer not found', 404);

    Customer.findByIdAndDelete(id);
    return sendSuccess(res, { id, name: cust.name }, 'Customer deleted successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
};
