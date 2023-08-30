import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendUpdate = async (message: string) => {
  const info = await transporter.sendMail({
    from: `"${process.env.FROM_STRING}" <${process.env.EMAIL_USERNAME}>`, //
    to: process.env.TO_EMAIL,
    subject: "Server Status Changed",
    text: "Server Status Changed",
    html: `${message}`,
  });

  console.log("Message sent: %s", info.messageId);
};
