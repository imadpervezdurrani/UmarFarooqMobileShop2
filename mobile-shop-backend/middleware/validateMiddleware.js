import { sendError } from '../utils/apiResponse.js';

export const validateFields = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];
    requiredFields.forEach((field) => {
      if (req.body[field] === undefined || req.body[field] === '') {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return sendError(res, `Missing required fields: ${missing.join(', ')}`, 400);
    }
    next();
  };
};
