import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
  throw new Error("SMTP_USERNAME and SMTP_PASSWORD are required");
}

type MailOptions = {
  to: string;
  subject: string;
  message: string;
  from?: string;
};

const transporter = nodemailer.createTransport({
  // service: "gmail",
  // host: "smtp.gmail.com",
  host: "smtppro.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function verifyTransporter() {
  try {
    await new Promise((resolve, reject) => {
      transporter.verify((error) => {
        if (error) {
          console.log("Error verifying transporter", error);
          reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}
async function sendMail(mailOptions: MailOptions) {
  try {
    await verifyTransporter();
    const response = await transporter.sendMail({
      ...mailOptions,
      html: mailOptions.message,
    });
    return response;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

export { sendMail };
