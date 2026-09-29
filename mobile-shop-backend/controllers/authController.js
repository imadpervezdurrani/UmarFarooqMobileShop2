import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    const userEmail = (email || '').trim().toLowerCase();
    const user = User.findByEmail(userEmail);
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Secure password comparison
    let isMatch = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'celltech_mobile_shop_jwt_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    const { password: userPwd, ...userWithoutPassword } = user;

    return sendSuccess(res, { user: userWithoutPassword, token }, 'Logged in successfully');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, title } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email, and password', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = User.findByEmail(cleanEmail);
    if (existing) {
      return sendError(res, 'An account with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : (role === 'manager' ? 'manager' : 'staff');

    const newUser = User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
      title: title || (userRole === 'admin' ? 'Store Administrator' : (userRole === 'manager' ? 'Branch Manager' : 'Sales Staff')),
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET || 'celltech_mobile_shop_jwt_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    const { password: pwd, ...userWithoutPassword } = newUser;

    return sendSuccess(res, { user: userWithoutPassword, token }, 'Account created successfully', 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getMe = (req, res) => {
  return sendSuccess(res, req.user, 'Current user profile');
};

