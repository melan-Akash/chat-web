import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendWelcomeEmail = async (email, fullName) => {
    const mailOptions = {
        from: `"Chat App Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Chat App - Let's Get Started!",
        html: `
            <div style="background-color: #f4f7f9; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <!-- Header with Gradient -->
                    <div style="background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 1px;">Welcome to Chat App</h1>
                    </div>
                    
                    <!-- Content Area -->
                    <div style="padding: 40px; color: #333333; line-height: 1.6;">
                        <h2 style="color: #4A00E0; margin-top: 0;">Hi ${fullName},</h2>
                        <p style="font-size: 16px;">We're absolutely thrilled to have you join our community! Your account has been successfully created and you're now ready to connect with friends and colleagues across the globe.</p>
                        
                        <div style="background-color: #f0f4ff; border-left: 4px solid #4A00E0; padding: 20px; margin: 30px 0; border-radius: 4px;">
                            <p style="margin: 0; font-weight: 500; color: #4A00E0;">What's next?</p>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 15px;">
                                <li>Complete your profile with a bio and picture</li>
                                <li>Search for friends using their email</li>
                                <li>Start your first conversation instantly!</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%); color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(74, 0, 224, 0.2);">Launch Chat App</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #777777; margin-bottom: 0;">If you have any questions, feel free to reply to this email. Our support team is always here to help!</p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="margin: 0; font-size: 12px; color: #999999;">&copy; ${new Date().getFullYear()} Chat App Inc. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999999;">123 Innovation Way, Tech City, TC 10101</p>
                    </div>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Welcome email sent successfully to", email);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};
