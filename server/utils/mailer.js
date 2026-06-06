const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Acme <onboarding@resend.dev>', // Use a verified domain in production
      to: [to],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return false;
    }

    console.log('Message sent via Resend, ID: %s', data.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendEmail };
