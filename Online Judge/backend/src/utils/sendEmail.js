import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Use real Gmail / SMTP
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Fallback to Ethereal email for development testing
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.warn("⚠️ Using Ethereal Email for development. Add EMAIL_USER and EMAIL_PASS to .env for real emails.");
    }

    const mailOptions = {
        from: `"OJ Backend" <${process.env.EMAIL_USER || 'no-reply@onlinejudge.local'}>`,
        to: email,
        subject,
        text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (!process.env.EMAIL_USER) {
        console.log("✉️ Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
};