import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { isEmailValid, isPasswordValid } from '../utils/auth';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            error: 'VALIDATION_ERROR',
            details: errors.array()
        });
    }
    return next();
};

export const validateSendOtp = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    validate
];

export const validateVerifyOtp = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('code')
        .isLength({ min: 6, max: 6 })
        .withMessage('Mã OTP phải có 6 chữ số')
        .isNumeric()
        .withMessage('Mã OTP chỉ được chứa số'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu phải có ít nhất 8 ký tự')
        .custom((value) => {
            if (!isPasswordValid(value)) {
                throw new Error('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
            }
            return true;
        }),
    body('fullName')
        .isLength({ min: 2, max: 100 })
        .withMessage('Họ tên phải có từ 2-100 ký tự')
        .trim(),
    body('phone')
        .optional()
        .isMobilePhone('vi-VN')
        .withMessage('Số điện thoại không hợp lệ'),
    validate
];

export const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống'),
    validate
];

export const validateRegister = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu phải có ít nhất 8 ký tự')
        .custom((value) => {
            if (!isPasswordValid(value)) {
                throw new Error('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
            }
            return true;
        }),
    body('fullName')
        .isLength({ min: 2, max: 100 })
        .withMessage('Họ tên phải có từ 2-100 ký tự')
        .trim(),
    body('phone')
        .optional()
        .isMobilePhone('vi-VN')
        .withMessage('Số điện thoại không hợp lệ'),
    validate
]; 