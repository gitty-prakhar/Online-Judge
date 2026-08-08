import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
    console.log("Using User:", process.env.EMAIL_USER);
    console.log("Using Pass:", process.env.EMAIL_PASS ? "****" : "NOT SET");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Missing credentials in .env");
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Test Backend" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send to self
        subject: "Test Email from OJ Backend",
        text: "This is a test email to verify Nodemailer is working.",
    };

    try {
        console.log("Attempting to send email...");
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully! Message ID:", info.messageId);
    } catch (err) {
        console.error("Error sending email:", err);
    }
}

testEmail();
