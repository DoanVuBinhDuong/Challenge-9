import { Router } from 'express';
import {
    sendOtp,
    verifyOtp,
    login,
    register,
    getProfile
} from '../controllers/auth.controller';
import {
    validateSendOtp,
    validateVerifyOtp,
    validateLogin,
    validateRegister
} from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/auth/send-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Gửi mã OTP về email để đăng ký
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mã OTP đã được gửi
 */
router.post('/send-otp', validateSendOtp, sendOtp);

/**
 * @openapi
 * /api/auth/verify-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Xác thực OTP và tạo user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 */
router.post('/verify-otp', validateVerifyOtp, verifyOtp);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 */
router.post('/login', validateLogin, login);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng ký trực tiếp (không cần OTP)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 */
router.post('/register', validateRegister, register);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Lấy thông tin profile (cần Bearer JWT)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin profile thành công
 */
router.get('/profile', authenticateToken, getProfile);

export default router; 