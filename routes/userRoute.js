const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/me', userController.getProfile);
router.put('/me/name', userController.updateName);
router.put('/me/address', userController.updateAddress);
router.post('/logout', userController.logout);

module.exports = router;