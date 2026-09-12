import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const from = `${process.env.FROM_NAME || "Bangkok Days"} <${process.env.SMTP_FROM}>`;
  
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, "<br>"),
  });
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const verifyUrl = `${process.env.FRONTEND_URL || process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`
  await sendEmail({
    to,
    subject: "【バンコクデイズ】メールアドレスの確認",
    text: `${name} 様\n\n以下のリンクをクリックしてメールアドレスを確認してください。\n\n${verifyUrl}\n\nこのリンクは24時間有効です。`,
    html: `<p>${name} 様</p><p>以下のリンクをクリックしてメールアドレスを確認してください。</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>このリンクは24時間有効です。</p>`,
  })
}
