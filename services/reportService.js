const Report = require('../models/report');
const User = require('../models/User');
const Brevo = require('@getbrevo/brevo');

// Load Brevo API key from .env
const brevoClient = new Brevo.TransactionalEmailsApi();
brevoClient.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sendUserReportConfirmation = async (toEmail, issueType, address) => {
  try {
    await brevoClient.sendTransacEmail({
      subject: 'Report Received - Smart Waste Management',
      sender: { name: 'Smart Waste Management', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: toEmail }],
      htmlContent: `
        <p>Thank you for submitting a report!</p>
        <p><strong>Issue Type:</strong> ${issueType}</p>
        <p><strong>Location:</strong> ${address}</p>
        <p>We will review and take appropriate action as soon as possible.</p>
        <br>
        <p>- Smart Waste Management Team</p>
      `
    });
  } catch (err) {
    console.error('Error sending report confirmation email:', err.message);
  }
};

async function createReport({ issueType, userId, description, image, latitude, longitude, address }) {
  const newReport = await Report.create({
    issueType,
    userId,
    description,
    image,
    latitude,
    longitude,
    address
  });

  // Fetch user email
  const user = await User.findByPk(userId);
  if (user && user.email) {
    await sendUserReportConfirmation(user.email, issueType, address);
  }

  return newReport;
}

async function getReportsByUser(userId) {
  return Report.findAll({ where: { userId } });
}


async function getLatestResolvedReports(limit = 5) {
  return Report.findAll({
    where: { status: 'Resolved' },
    order: [['timestamp', 'DESC']],
    limit
  });
}
module.exports = { createReport , getReportsByUser, getLatestResolvedReports };