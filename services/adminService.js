const Report = require('../models/report');
const User = require('../models/user');
const Brevo = require('@getbrevo/brevo');


const brevoClient = new Brevo.TransactionalEmailsApi();
brevoClient.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);


const sendStatusEmail = async (toEmail, subject, content) => {
  try {
    await brevoClient.sendTransacEmail({
      subject,
      sender: { name: 'Smart Waste Admin', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: toEmail }],
      htmlContent: `<p>${content}</p>`
    });
  } catch (err) {
    console.error('Error sending email:', err.message);
  }
};

const getAllReports = async () => {
  return await Report.findAll({ 
    order: [['timestamp', 'DESC']],
    include: [{
      model: User,
      attributes: ['name']
    }]
   });
};


const markInProgress = async (id, description, image) => {
  const report = await Report.findByPk(id);
  if (!report) throw new Error('Report not found');
  if (report.status !== 'Pending') throw new Error('Only pending reports can be marked as In Progress');

  report.status = 'In Progress';
  report.inProgressDescription = description;
  if (image) report.inProgressImage = image;

  await report.save();

  const user = await User.findByPk(report.userId);
  if (user?.email) {
    await sendStatusEmail(
      user.email,
      'Report Status Updated - In Progress',
      `Your report for "${report.issueType}" is now marked as <strong>In Progress</strong>.<br><br>${description}`
    );
  }

  return report;
};

const resolveReport = async (id, description, image) => {
  const report = await Report.findByPk(id);
  if (!report) throw new Error('Report not found');

  report.status = 'Resolved';
  report.resolveDescription = description;
  if (image) report.resolveImage = image;

  await report.save();

  const user = await User.findByPk(report.userId);
  if (user?.email) {
    await sendStatusEmail(
      user.email,
      'Report Resolved',
      `Good news! Your report for "${report.issueType}" has been resolved.<br><br>${description}`
    );
  }

  return report;
};



// const markInProgress = async (id) => {
//   const report = await Report.findByPk(id);
//   if (!report) throw new Error('Report not found');
//   if (report.status !== 'Pending') throw new Error('Only pending reports can be marked as In Progress');

//   report.status = 'In Progress';
//   await report.save();

//   // Fetch user and send email
//   const user = await User.findByPk(report.userId);
//   if (user && user.email) {
//     await sendStatusEmail(
//       user.email,
//       'Report Status Updated - In Progress',
//       `Your report for "${report.issueType}" is now marked as <strong>In Progress</strong>.`
//     );
//   }

//   return report;
// };

// const resolveReport = async (id) => {
//   const report = await Report.findByPk(id);
//   if (!report) throw new Error('Report not found');

//   report.status = 'Resolved';
//   await report.save();

//   // Fetch user and send email
//   const user = await User.findByPk(report.userId);
//   if (user && user.email) {
//     await sendStatusEmail(
//       user.email,
//       'Report Resolved',
//       `Good news! Your report for "${report.issueType}" has been <strong>resolved</strong>.`
//     );
//   }

//   return report;
// };

const deleteReport = async (id) => {
  const deletedCount = await Report.destroy({ where: { id } });
  if (deletedCount === 0) throw new Error('Report not found or already deleted');
};

const getAllUsers = async () => {
  return await User.findAll({ order: [['createdAt', 'DESC']] });
}

// Edit user
const editUser = async (id, { name, email, address }) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  user.name = name;
  user.email = email;
  user.address = address;
  await user.save();
};

// Delete user
const deleteUser = async (id) => {
  const deleted = await User.destroy({ where: { id } });
  if (!deleted) throw new Error('User not found or already deleted');
};

module.exports = {
  getAllReports,
  markInProgress,
  resolveReport,
  deleteReport,
  getAllUsers,
  editUser,
  deleteUser
};
