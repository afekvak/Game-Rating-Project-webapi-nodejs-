const sgMail = require("@sendgrid/mail");

// ✅ Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends a verification email with a verification link.
 */
const sendVerificationEmail = async (email, token) => {
    try {
        const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${token}`;

        const msg = {
            to: email, // Recipient email
            from: process.env.EMAIL_FROM, // Sender email (must be verified in SendGrid)
            subject: "Verify Your Email - AI Game Recommender",
            html: `
                <h2>Welcome to AI Game Recommender! 🎮</h2>
                <p>Click the link below to verify your email address:</p>
                <a href="${verificationLink}" style="background-color:blue; color:white; padding:10px; text-decoration:none; border-radius:5px;">
                    ✅ Verify Email
                </a>
                <p>If you didn't register, please ignore this email.</p>
            `,
        };

        await sgMail.send(msg);
        console.log(`✅ Verification email sent to: ${email}`);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};

/**
 * Sends a welcome email after successful verification.
 */
const sendWelcomeEmail = async (email, username) => {
    try {
        const homePageLink = `${process.env.BASE_URL}/`;

        const msg = {
            to: email, // Recipient email
            from: process.env.EMAIL_FROM, // Sender email (must be verified in SendGrid)
            subject: "🎉 Welcome to AI Game Recommender!",
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h1 style="color: #2c3e50;">Welcome, ${username}! 🎮</h1>
                    <p style="font-size: 18px; color: #333;">
                        We're excited to have you join the AI Game Recommender family! 🚀
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        Start discovering amazing games recommended just for you. Click below to get started:
                    </p>
                    <a href="${homePageLink}" style="background-color:#3498db; color:white; padding:12px 20px; text-decoration:none; border-radius:5px; font-size:18px; display:inline-block; margin-top:10px;">
                        🎮 Go to Home Page
                    </a>
                    <p style="font-size: 14px; color: #777; margin-top: 20px;">
                        If you have any questions, feel free to reach out to us. Happy gaming! 🎯
                    </p>
                </div>
            `,
        };

        await sgMail.send(msg);
        console.log(`✅ Welcome email sent to: ${email}`);
    } catch (error) {
        console.error("❌ Error sending welcome email:", error);
    }
};

module.exports = { sendVerificationEmail, sendWelcomeEmail };
