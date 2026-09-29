import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getUsers = (req, res) => {
  const users = User.find().map(({ password, ...u }) => u);
  return sendSuccess(res, users, 'Users retrieved');
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, title } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    const existing = User.findByEmail(email);
    if (existing) {
      return sendError(res, 'A user with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || 'staff',
      title: title || (role === 'admin' ? 'Store Administrator' : 'Sales Executive'),
    });

    const { password: _, ...safeUser } = newUser;
    return sendSuccess(res, safeUser, 'New staff member added successfully', 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, email, title, avatar } = req.body;

    if (!userId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (title) updates.title = title.trim();
    if (avatar) updates.avatar = avatar.trim();

    const updated = User.findByIdAndUpdate(userId, updates);
    if (!updated) return sendError(res, 'User not found', 404);

    const { password: _, ...safeUser } = updated;
    return sendSuccess(res, safeUser, 'Profile updated successfully');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required', 400);
    }

    if (newPassword.length < 4) {
      return sendError(res, 'New password must be at least 4 characters long', 400);
    }

    const user = User.findById(userId);
    if (!user) return sendError(res, 'User not found', 404);

    let isMatch = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      isMatch = await bcrypt.compare(oldPassword, user.password);
    } else {
      isMatch = (oldPassword === user.password);
    }

    if (!isMatch) {
      return sendError(res, 'Incorrect current password', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    User.findByIdAndUpdate(userId, { password: hashedPassword });

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, title, password } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (role) updates.role = role;
    if (title) updates.title = title.trim();
    if (password && password.trim()) {
      updates.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = User.findByIdAndUpdate(id, updates);
    if (!updated) return sendError(res, 'User not found', 404);

    const { password: _, ...safeUser } = updated;
    return sendSuccess(res, safeUser, 'Staff member details updated successfully');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const deleteUser = (req, res) => {
  const { id } = req.params;

  if (req.user?.id === id) {
    return sendError(res, 'You cannot delete your own active administrator account', 400);
  }

  const deleted = User.findByIdAndDelete(id);
  if (!deleted) return sendError(res, 'User not found', 404);

  return sendSuccess(res, null, 'Staff member deleted successfully');
};

export const updateUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const updated = User.findByIdAndUpdate(id, { role });
  if (!updated) return sendError(res, 'User not found', 404);
  return sendSuccess(res, updated, `User role updated to ${role}`);
};
