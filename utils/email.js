const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
   constructor(user, url) {
      this.to = user.email;
      this.firstName = user.name.split(' ')[0];
      this.url = url;
      this.from = `Victor Prisacariu <${process.env.EMAIL_FROM}>`;
   }

   newTransport() {
      if (process.env.NODE_ENV === 'production') {
         return;
      }
      return nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
         },
         //iF USING GMAIL MUST ACTIVATE LESS SECURE APP OPTION!
         // BUT IN PRODUCTION NO GMAIL- 500 EM LIMIT=> SPAMMER
      });
   }
   async send(template, subject) {
      const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
         firstName: this.firstName,
         url: this.url,
         subject,
      });
      const mailOptions = {
         from: this.from,
         to: this.to,
         subject,
         html,
         text: htmlToText(html),
      };

      await this.newTransport().sendMail(mailOptions);
   }
   async sendWelcome() {
      await this.send('welcome', 'Welcome to Natours!');
   }
   async sendResetPassword() {
      await this.send('passwordReset', 'Your password reset token! Valid for 10 minutes!');
   }
};
