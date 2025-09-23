import { model,Schema } from "mongoose";

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp:{
        type: String,
        required: true
    },
    expiresAt:{
        type: Date,
        required: true
    }
},{
    timestamps: true
})
export const verifyOTP = model("verifyOTP",otpSchema);