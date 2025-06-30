import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyJWT } from '../utils/auth';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token is required',
            error: 'UNAUTHORIZED'
        });
    }

    try {
        const user = verifyJWT(token);
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token',
                error: 'FORBIDDEN'
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid token',
            error: 'FORBIDDEN'
        });
    }
};

// Middleware kiểm tra role linh hoạt
export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                error: 'UNAUTHORIZED'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
                error: 'FORBIDDEN',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }

        return next();
    };
};

// Middleware chỉ cho phép ADMIN
export const requireAdmin = requireRole(['ADMIN']);

// Middleware cho phép cả USER và ADMIN
export const requireUser = requireRole(['USER', 'ADMIN']);

// Middleware chỉ cho phép USER
export const requireUserOnly = requireRole(['USER']);

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const user = verifyJWT(token);
            if (user) {
                req.user = user;
            }
        } catch (error) {
            // Token không hợp lệ nhưng không block request
            console.log('Invalid token in optional auth:', error);
        }
    }

    return next();
}; 