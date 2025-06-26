const adminService = require('../services/adminService');

const handleGetAllReports = async (req, res) => {
  try {
    if (req.cookies.isAdmin !== 'true') return res.status(403).json({ message: 'Forbidden' });

    const reports = await adminService.getAllReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const handleMarkInProgress = async (req, res) => {
  try {
    const id = req.params.id;
    const description = req.body.description;
    const image = req.file ? req.file.filename : null;

    const report = await adminService.markInProgress(id, description, image);
    res.json({ message: 'Report marked as In Progress', report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const handleResolveReport = async (req, res) => {
  try {
    const id = req.params.id;
    const description = req.body.description;
    const image = req.file ? req.file.filename : null;

    const report = await adminService.resolveReport(id, description, image);
    res.json({ message: 'Report resolved', report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// const handleMarkInProgress = async (req, res) => {
//   try {
//     const report = await adminService.markInProgress(req.params.id);
//     res.json({ message: 'Report marked as In Progress', report });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const handleResolveReport = async (req, res) => {
//   try {
//     const report = await adminService.resolveReport(req.params.id);
//     res.json({ message: 'Report resolved', report });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const handleDeleteReport = async (req, res) => {
  try {
    await adminService.deleteReport(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const handleGetAllUsers = async (req, res) => {
  try {
    if (req.cookies.isAdmin !== 'true') return res.status(403).json({ message: 'Forbidden' });

    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  handleGetAllReports,
  handleMarkInProgress,
  handleResolveReport,
  handleDeleteReport,
  handleGetAllUsers
};
