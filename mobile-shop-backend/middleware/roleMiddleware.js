import { sendError } from '../utils/apiResponse.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'] || (req.user ? req.user.role : 'staff');

    if (!roles.includes(userRole)) {
      return sendError(
        res,
        `Permission Denied: User role '${userRole}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};
