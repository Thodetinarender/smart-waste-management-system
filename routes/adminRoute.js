// routes/adminRoute.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/admin/reports', adminController.handleGetAllReports);
// router.put('/admin/reports/:id/inprogress', adminController.handleMarkInProgress);
// router.put('/admin/reports/:id/resolve', adminController.handleResolveReport);
router.delete('/admin/reports/:id', adminController.handleDeleteReport);
router.get('/admin/users', adminController.handleGetAllUsers);

router.put('/admin/reports/:id/inprogress', upload.single('image'), adminController.handleMarkInProgress);
router.put('/admin/reports/:id/resolve', upload.single('image'), adminController.handleResolveReport);


module.exports = router;
