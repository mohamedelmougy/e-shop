const nodemailer = require("nodemailer");

const sendEmail = async(options) => {
  // 1-create transporter (service that will send email "gmail","mailgun","mailtrap","sendgrid")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2-define email options (like from, to,subject,email content)
  const mailOptions = {
    from: "E-shop <ssss9870639@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3-send email
  await transporter.sendMail(mailOptions)
};

module.exports = sendEmail;
