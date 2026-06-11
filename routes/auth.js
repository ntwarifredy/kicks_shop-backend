const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updateAvatar,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  getUserById,
  deleteUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/avatar', protect, updateAvatar);
router.put('/avatar/upload', protect, upload.single('avatar'), updateAvatar);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/users', protect, authorize('admin'), getUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
