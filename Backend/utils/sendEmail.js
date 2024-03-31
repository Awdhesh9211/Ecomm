import nodeMailer from 'nodemailer';

const sendEmail = async ({email,subject,message}) => {
  // Transporter config 
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  // mail config
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject:subject,
    text: message,
  };
  // sending mail
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
