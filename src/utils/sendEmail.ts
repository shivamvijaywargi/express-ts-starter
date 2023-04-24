import fs from 'fs';
import path from 'path';

import handlebars from 'handlebars';
import nodemailer from 'nodemailer';

import Logger from '@/utils/logger';

// Below line is for typescript specific to use __dirname
declare const __dirname: string;

interface IPayload {
  name: string;
  link: string;
}

const sendEmail = async (
  email: string,
  subject: string,
  payload: IPayload,
  template: string,
) => {
  let transporter;

  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // hostname
      secure: false, // TLS requires secureConnection to be false
      port: 587, // port for secure SMTP
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (process.env.NODE_ENV === 'development') {
    transporter = nodemailer.createTransport({
      host: 'mailhog',
      port: 1025,
    });
  }

  try {
    const sourceDirectory = fs.readFileSync(
      path.join(__dirname, template),
      'utf8',
    );

    const compiledTemplate = handlebars.compile(sourceDirectory);

    const emailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: subject,
      html: compiledTemplate(payload),
    };

    await transporter?.sendMail(emailOptions);
  } catch (error) {
    Logger.error(`email not sent: ${error}`);
  }
};

export default sendEmail;

/**
 * USAGE: await sendEmail(from, to, subject, html)
 */
