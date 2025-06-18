const Report = require('../models/report');

async function createReport({ issueType, userId, description, image, latitude, longitude, address }) {
  return Report.create({
    issueType,
    userId,
    description,
    image,
    latitude,
    longitude,
    address
  });
}

async function getReportsByUser(userId) {
  return Report.findAll({ where: { userId } });
}

module.exports = { createReport , getReportsByUser };