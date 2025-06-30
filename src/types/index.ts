import { Request } from 'express';

export interface UserPayload {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

export interface AuthRequest extends Request {
    user?: UserPayload;
}

export interface RegisterRequest {
    email: string;
    phone?: string;
    password: string;
    fullName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SendOtpRequest {
    email: string;
}

export interface VerifyOtpRequest {
    email: string;
    code: string;
    password: string;
    fullName: string;
    phone?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
} 