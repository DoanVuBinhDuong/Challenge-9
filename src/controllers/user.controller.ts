import { Request, Response } from 'express';
import { User } from '../models';
import { AuthRequest, ApiResponse } from '../types';
import { IUser } from '../models/User';

// Lấy danh sách user (chỉ admin)
export const getUsers = async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
        const users = await User.find().select('-password');
        return res.json({
            success: true,
            message: 'Lấy danh sách user thành công',
            data: { users }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

// Gán quyền admin cho user khác (chỉ admin)
export const grantAdmin = async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id) as IUser | null;
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user',
                error: 'USER_NOT_FOUND'
            });
        }
        if (user.role === 'ADMIN') {
            return res.status(400).json({
                success: false,
                message: 'User đã là admin',
                error: 'ALREADY_ADMIN'
            });
        }
        user.role = 'ADMIN';
        await user.save();
        return res.json({
            success: true,
            message: 'Gán quyền admin thành công',
            data: { user: { id: user._id, email: user.email, role: user.role } }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

// Xoá user khác (chỉ admin, không được xoá chính mình)
export const deleteUser = async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
        const { id } = req.params;
        if (req.user?.id === id) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xoá chính mình',
                error: 'CANNOT_DELETE_SELF'
            });
        }
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user',
                error: 'USER_NOT_FOUND'
            });
        }
        return res.json({
            success: true,
            message: 'Xoá user thành công',
            data: { id: user._id, email: user.email }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}; 