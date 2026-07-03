const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

const enviarCorreo = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error enviando correo:', error);
    return null;
  }
};

module.exports = {
  enviarCorreo,
};
