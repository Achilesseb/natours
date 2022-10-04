const nodemailer = require('nodemailer');

const sendMail = async (options) => {
   //1) Create transported

   const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
         user: process.env.EMAIL_USERNAME,
         pass: process.env.EMAIL_PASSWORD,
      },
      //iF USING GMAIL MUST ACTIVATE LESS SECURE APP OPTION!
      // BUT IN PRODUCTION NO GMAIL- 500 EM LIMIT=> SPAMMER
   });

   //2) Define the email options

   const mailOptions = {
      from: 'Victor Prisacariu <victorprisacariu@victor.io>',
      to: options.email,
      subject: options.subject,
      text: options.message,
   };
   //3) Actually send email
   await transporter.sendMail(mailOptions);
};

module.exports = sendMail;