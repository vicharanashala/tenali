const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_b8ERV4vB_PckH1dFUdXwovxJuqztCVF18');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await resend.emails.send({
      from: 'Tenali Math <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = { transporter: { sendMail: sendEmail }, generateOTP };