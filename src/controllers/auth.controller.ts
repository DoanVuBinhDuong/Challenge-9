import { Request, Response } from 'express';
import {
    hashPassword,
    comparePassword,
    generateJWT,
    generateOTP,
    isEmailValid,
    isPasswordValid
} from '../utils/auth';
import {
    SendOtpRequest,
    VerifyOtpRequest,
    LoginRequest,
    RegisterRequest,
    ApiResponse
} from '../types';
import { User, OtpCode } from '../models';
import { IUser } from '../models/User';

export const sendOtp = async (req: Request<{}, {}, SendOtpRequest>, res: Response<ApiResponse>) => {
    try {
        const { email } = req.body;

        if (!email || !isEmailValid(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ',
                error: 'INVALID_EMAIL'
            });
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng',
                error: 'EMAIL_EXISTS'
            });
        }

        // Xóa OTP cũ nếu có
        await OtpCode.deleteMany({
            email,
            expiresAt: { $lt: new Date() }
        });

        // Tạo OTP mới
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

        await OtpCode.create({
            email,
            code: otpCode,
            expiresAt
        });

        // TODO: Gửi email OTP (hiện tại chỉ log ra console)
        console.log(`OTP for ${email}: ${otpCode}`);

        return res.json({
            success: true,
            message: 'Mã OTP đã được gửi đến email của bạn',
            data: {
                email,
                expiresIn: 300 // 5 phút
            }
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const verifyOtp = async (req: Request<{}, {}, VerifyOtpRequest>, res: Response<ApiResponse>) => {
    try {
        const { email, code, password, fullName, phone } = req.body;

        if (!email || !code || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc',
                error: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Tìm OTP
        const otpRecord = await OtpCode.findOne({
            email,
            code,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
                error: 'INVALID_OTP'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Tạo user mới
        const user = await User.create({
            email,
            password: hashedPassword,
            fullName,
            phone,
            role: 'USER'
        }) as IUser;

        // Đánh dấu OTP đã sử dụng
        await OtpCode.findByIdAndUpdate(otpRecord._id, { isUsed: true });

        // Tạo JWT token
        const token = generateJWT({
            id: (user._id as any).toString(),
            email: user.email,
            role: user.role
        });

        return res.json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user: {
                    id: user._id as any,
                    email: user.email,
                    fullName: user.fullName,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar
                },
                token
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response<ApiResponse>) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email và mật khẩu không được để trống',
                error: 'MISSING_CREDENTIALS'
            });
        }

        // Tìm user
        const user = await User.findOne({ email }) as IUser | null;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng',
                error: 'INVALID_CREDENTIALS'
            });
        }

        // Kiểm tra user có active không
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản đã bị khóa',
                error: 'ACCOUNT_DISABLED'
            });
        }

        // Kiểm tra password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng',
                error: 'INVALID_CREDENTIALS'
            });
        }

        // Tạo JWT token
        const token = generateJWT({
            id: (user._id as any).toString(),
            email: user.email,
            role: user.role
        });

        return res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: {
                    id: user._id as any,
                    email: user.email,
                    fullName: user.fullName,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response<ApiResponse>) => {
    try {
        const { email, password, fullName, phone } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc',
                error: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng',
                error: 'EMAIL_EXISTS'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Tạo user mới
        const user = await User.create({
            email,
            password: hashedPassword,
            fullName,
            phone,
            role: 'USER'
        }) as IUser;

        // Tạo JWT token
        const token = generateJWT({
            id: (user._id as any).toString(),
            email: user.email,
            role: user.role
        });

        return res.json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user: {
                    id: user._id as any,
                    email: user.email,
                    fullName: user.fullName,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar
                },
                token
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const getProfile = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng',
                error: 'USER_NOT_FOUND'
            });
        }

        const user = await User.findById(userId).select('-password') as IUser | null;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
                error: 'USER_NOT_FOUND'
            });
        }

        return res.json({
            success: true,
            message: 'Lấy thông tin profile thành công',
            data: { user }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}; 