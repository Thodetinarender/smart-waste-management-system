const Report = require('../models/report');

const getAllReports = async () => {
  return await Report.findAll({ order: [['timestamp', 'DESC']] });
};

const resolveReport = async (id) => {
  const report = await Report.findByPk(id);
  if (!report) throw new Error('Report not found');

  report.status = 'Resolved';
  await report.save();
  return report;
};

const deleteReport = async (id) => {
  const deletedCount = await Report.destroy({ where: { id } });
  if (deletedCount === 0) throw new Error('Report not found or already deleted');
};

module.exports = {
  getAllReports,
  resolveReport,
  deleteReport
};
