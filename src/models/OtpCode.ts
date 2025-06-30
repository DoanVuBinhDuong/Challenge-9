import mongoose, { Document, Schema } from 'mongoose';

export interface IOtpCode extends Document {
    email: string;
    code: string;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
}

const otpCodeSchema = new Schema<IOtpCode>({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        length: 6
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'otp_codes'
});

// Indexes
otpCodeSchema.index({ email: 1 });
otpCodeSchema.index({ code: 1 });
otpCodeSchema.index({ expiresAt: 1 });
otpCodeSchema.index({ isUsed: 1 });
otpCodeSchema.index({ createdAt: 1 });

// TTL index để tự động xóa OTP hết hạn sau 1 giờ
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export const OtpCode = mongoose.model<IOtpCode>('OtpCode', otpCodeSchema); 