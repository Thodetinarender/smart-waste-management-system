// routes/adminRoute.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/admin/reports', adminController.handleGetAllReports);
router.put('/admin/reports/:id/resolve', adminController.handleResolveReport);
router.delete('/admin/reports/:id', adminController.handleDeleteReport);

module.exports = router;
