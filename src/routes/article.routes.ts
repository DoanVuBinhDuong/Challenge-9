import { Router } from 'express';
import {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle
} from '../controllers/article.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/articles:
 *   get:
 *     tags:
 *       - Articles
 *     summary: Lấy danh sách bài viết (public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Danh mục
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Trường sắp xếp
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *         description: Thứ tự sắp xếp (asc|desc)
 *     responses:
 *       200:
 *         description: Lấy danh sách bài viết thành công
 */
router.get('/', getArticles);

/**
 * @openapi
 * /api/articles/{id}:
 *   get:
 *     tags:
 *       - Articles
 *     summary: Lấy chi tiết bài viết (public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài viết
 *     responses:
 *       200:
 *         description: Lấy bài viết thành công
 */
router.get('/:id', getArticleById);

// Protected routes (cần đăng nhập)
/**
 * @openapi
 * /api/articles:
 *   post:
 *     tags:
 *       - Articles
 *     summary: Tạo bài viết (cần Bearer JWT)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               summary:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Tạo bài viết thành công
 */
router.post('/', authenticateToken, createArticle);

/**
 * @openapi
 * /api/articles/{id}:
 *   put:
 *     tags:
 *       - Articles
 *     summary: Cập nhật bài viết (cần Bearer JWT)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài viết
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               summary:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật bài viết thành công
 */
router.put('/:id', authenticateToken, updateArticle);

/**
 * @openapi
 * /api/articles/{id}:
 *   delete:
 *     tags:
 *       - Articles
 *     summary: Xóa bài viết (cần Bearer JWT)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài viết
 *     responses:
 *       200:
 *         description: Xóa bài viết thành công
 */
router.delete('/:id', authenticateToken, deleteArticle);

export default router; 