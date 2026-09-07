import express from 'express';
import {
  getUsers,
  createUser,
  updateProfile,
  changePassword,
  updateUser,
  deleteUser,
  updateUserRole,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.post('/', authorize('admin'), createUser);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/role', authorize('admin'), updateUserRole);

export default router;
