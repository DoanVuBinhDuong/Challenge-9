import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { UserPayload } from '../types';

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

export const generateJWT = (payload: UserPayload): string => {
    const secret: Secret = process.env.JWT_SECRET || 'fallback-secret';
    const expiresIn: SignOptions['expiresIn'] = 60 * 60 * 24 * 7; // 7 ngày
    return jwt.sign(payload, secret, { expiresIn });
};

export const verifyJWT = (token: string): UserPayload | null => {
    try {
        const secret: Secret = process.env.JWT_SECRET || 'fallback-secret';
        const decoded = jwt.verify(token, secret) as UserPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isPasswordValid = (password: string): boolean => {
    // Ít nhất 8 ký tự, có chữ hoa, chữ thường, số
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}; 