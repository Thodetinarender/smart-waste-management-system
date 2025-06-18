const reportService = require('../services/reportService');

async function createReport(req, res) {
  try {
    const { issueType, description, latitude, longitude, address } = req.body;
    const image = req.file ? req.file.filename : null;
    if (!image) return res.status(400).send('Image is required.');

    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).send('Not authenticated.');

    await reportService.createReport({
      issueType,
      userId,
      description,
      image,
      latitude,
      longitude,
      address
    });

    res.status(201).send('Report submitted successfully.');
  } catch (err) {
    res.status(500).send('Error submitting report.');
  }
}


async function getUserReports(req, res) {
  try {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).send('Not authenticated.');
    const reports = await reportService.getReportsByUser(userId);
    res.json(reports);
  } catch (err) {
    res.status(500).send('Error fetching reports.');
  }
}

module.exports = { createReport , getUserReports };