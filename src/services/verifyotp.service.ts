import { verifyOTP } from "../models/otp.model";
import nodemailer from "nodemailer";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // random từ 100000 → 999999
}

export const verificationOTP = {
  sendOTP: async (email: string) => {
    try {
      const otpCode = generateOTP();

      // upsert OTP (update nếu tồn tại, tạo mới nếu chưa)
      await verifyOTP.findOneAndUpdate(
        { email },
        { otp: otpCode, expiresAt: new Date(Date.now() + 60 * 1000) }, // reset TTL 1 phút
        { upsert: true, new: true }
      );

      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_PASS,
        },
        pool: true,
        maxConnections: 1,
        maxMessages: 5,
        connectionTimeout: 5000,
        greetingTimeout: 3000,
        socketTimeout: 7000,
      });
      const htmlCode = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 480px; margin: auto; background-color: #fafafa;">
      <h2 style="text-align: center; color: #2c3e50;">IMPENGLISH Verification</h2>
      <p>Dear user,</p>
      <p>Here is your <strong style="color:#e74c3c;">One-Time Password (OTP)</strong> to verify your account:</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; color: #ffffff; background: #3498db; padding: 12px 24px; border-radius: 6px; letter-spacing: 2px;">
          ${otpCode}
        </span>
      </div>
      
      <p style="text-align: center; font-size: 14px; color: #555;">
        ⚠️ This code will expire in <strong style="color:#e67e22;">1 minute</strong>.
      </p>
      
      <p>If you did not request this code, please ignore this email.</p>
      
      <p style="margin-top: 30px; font-size: 13px; color: #999; text-align: center;">
        — IMPENGLISH Security Team
      </p>
    </div>`
      const mailOptions = {
        from: `"IMPENGLISH" <${process.env.AUTH_EMAIL}>`,
        to: email,
        subject: "Your OTP Code",
        html: htmlCode,
      };

      await transporter.sendMail(mailOptions);
      return { success: true, message: "OTP sent successfully" };
    } catch (error) {
      console.error("Error sending OTP:", error);
      return { success: false, message: "Failed to send OTP" };
    }
  },

  verifyUserOTP: async (email: string, otp: string) => {
    try {
      const record = await verifyOTP.findOne({ email,otp });

      if (!record) {
        return { success: false, message: "Invalid OTP" };
      }

      if (record.expiresAt < new Date()) {
        return { success: false, message: "OTP is expired" };
      }

      // Xác thực thành công → xóa OTP để tránh reuse
      await verifyOTP.deleteMany({ email });
      return { success: true, message: "OTP verified successfully!" };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, message: "Failed to verify OTP" };
    }
  },

  getRecordOTP: async () => {
    return await verifyOTP.find();
  },

  resenOTP: async (email: string) => {
    try {
      const record = await verifyOTP.findOne({ email });
      if (!record) {
        return { success: false,title:"Success", message: "No OTP record found to resend" };
      }
      const otpCode = generateOTP();
      await verifyOTP.findOneAndUpdate(
        { email },
        { otp: otpCode, expiresAt: new Date(Date.now() + 60 * 1000) }, // reset TTL 1 phút
        { upsert: true, new: true }
      );
      return { success: true,title:"Success", message: "Resend OTP Successfully" };
    } catch (error) {
      console.error("Error resending OTP:", error);
      return { success: false,title:"Failed", message: "Failed to resend OTP" };
    }
  }
};
