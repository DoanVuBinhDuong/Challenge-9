import { Router } from 'express';
import { getUsers, grantAdmin, deleteUser } from '../controllers/user.controller';
import { authenticateToken, requireAdmin, requireUser, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Lấy danh sách user (chỉ ADMIN)
 *     description: Endpoint này chỉ dành cho ADMIN. USER thường sẽ nhận lỗi 403.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập (chỉ ADMIN mới được phép)
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/ForbiddenError'
 */
router.get('/', authenticateToken, requireAdmin, getUsers);

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Lấy thông tin profile của user hiện tại (USER/ADMIN)
 *     description: Endpoint này cho phép cả USER và ADMIN truy cập thông tin cá nhân của mình.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin profile thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile retrieved successfully"
 *                 data:
 *                   type: object
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/UnauthorizedError'
 */
router.get('/profile', authenticateToken, requireUser, (req, res) => {
    res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
            id: req.user?.id,
            email: req.user?.email,
            role: req.user?.role
        }
    });
});

/**
 * @openapi
 * /api/users/{id}/role:
 *   put:
 *     tags:
 *       - Users
 *     summary: Gán quyền admin cho user khác (chỉ ADMIN)
 *     description: Chỉ ADMIN mới có quyền gán role cho user khác. USER sẽ nhận lỗi 403.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user cần gán quyền
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: "ADMIN"
 *     responses:
 *       200:
 *         description: Gán quyền admin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Role updated successfully"
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập (chỉ ADMIN mới được phép)
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/ForbiddenError'
 */
router.put('/:id/role', authenticateToken, requireAdmin, grantAdmin);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Xoá user khác (chỉ ADMIN)
 *     description: Chỉ ADMIN mới có quyền xoá user khác. USER sẽ nhận lỗi 403.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user cần xoá
 *     responses:
 *       200:
 *         description: Xoá user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập (chỉ ADMIN mới được phép)
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/ForbiddenError'
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

export default router; 