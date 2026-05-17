const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration is missing. Set SMTP_HOST, SMTP_USER, SMTP_PASS.');
  }

  const port = SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587;
  const secure = SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Smart Expense Tracker <no-reply@smartexpensetracker.com>',
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
