const nodemailer = require('nodemailer');

const crearTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

const enviarCorreoCambioEstadoSolicitud = async ({
  destinatario,
  nombreDestinatario,
  estadoAnterior,
  estadoNuevo,
  nombreCurso,
  solicitudId,
  replyTo,
  nombreRemitente,
}) => {
  const transport = crearTransport();

  if (!transport) {
    process.stdout.write(
      '[EmailService] SMTP no configurado. Se omite envio de correo.\n'
    );
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transport.sendMail({
    from,
    ...(replyTo ? { replyTo } : {}),
    to: destinatario,
    subject: `MakerBox: actualizacion de solicitud ${solicitudId}`,
    text: [
      `Hola ${nombreDestinatario || 'estudiante'},`,
      '',
      `Tu solicitud de impresion (${solicitudId}) del curso ${
        nombreCurso || 'sin curso'
      } cambio de estado:`,
      `${estadoAnterior} -> ${estadoNuevo}`,
      ...(nombreRemitente ? ['', `Actualizado por: ${nombreRemitente}`] : []),
      '',
      'Saludos,',
      'Equipo MakerBox',
    ].join('\n'),
  });
};

module.exports = {
  enviarCorreoCambioEstadoSolicitud,
};
