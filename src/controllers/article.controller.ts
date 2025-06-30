import { Request, Response } from 'express';
import { Article, User } from '../models';
import { AuthRequest, ApiResponse } from '../types';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

export const createArticle = async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
        const { title, content, summary, imageUrl, category, tags } = req.body;
        const authorId = req.user?.id;

        if (!authorId) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng',
                error: 'UNAUTHORIZED'
            });
        }

        const article = await Article.create({
            title,
            content,
            summary,
            imageUrl,
            authorId,
            category,
            tags: tags || []
        });

        // Populate author info
        await article.populate('authorId', 'fullName email');

        return res.status(201).json({
            success: true,
            message: 'Tạo bài viết thành công',
            data: { article }
        });

    } catch (error) {
        console.error('Create article error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const getArticles = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            isPublished = true
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        // Build query
        const query: any = { isPublished: isPublished === 'true' };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search as string };
        }

        // Build sort
        const sort: any = {};
        sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

        const articles = await Article.find(query)
            .populate('authorId', 'fullName email')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const total = await Article.countDocuments(query);

        res.json({
            success: true,
            message: 'Lấy danh sách bài viết thành công',
            data: {
                articles,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get articles error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const getArticleById = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const { id } = req.params;

        const article = await Article.findById(id)
            .populate('authorId', 'fullName email');

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết',
                error: 'ARTICLE_NOT_FOUND'
            });
        }

        // Tăng view count
        await Article.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

        return res.json({
            success: true,
            message: 'Lấy bài viết thành công',
            data: { article }
        });

    } catch (error) {
        console.error('Get article error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const updateArticle = async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
        const { id } = req.params;
        const { title, content, summary, imageUrl, category, tags, isPublished } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng',
                error: 'UNAUTHORIZED'
            });
        }

        const article = await Article.findById(id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết',
                error: 'ARTICLE_NOT_FOUND'
            });
        }

        // Kiểm tra quyền (chỉ author hoặc admin mới được sửa)
        if (article.authorId.toString() !== userId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền sửa bài viết này',
                error: 'FORBIDDEN'
            });
        }

        const updateData: any = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (summary !== undefined) updateData.summary = summary;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (category !== undefined) updateData.category = category;
        if (tags) updateData.tags = tags;
        if (isPublished !== undefined) {
            updateData.isPublished = isPublished;
            if (isPublished && !article.publishedAt) {
                updateData.publishedAt = new Date();
            }
        }

        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('authorId', 'fullName email');

        return res.json({
            success: true,
            message: 'Cập nhật bài viết thành công',
            data: { article: updatedArticle }
        });

    } catch (error) {
        console.error('Update article error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const deleteArticle = async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng',
                error: 'UNAUTHORIZED'
            });
        }

        const article = await Article.findById(id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết',
                error: 'ARTICLE_NOT_FOUND'
            });
        }

        // Kiểm tra quyền (chỉ author hoặc admin mới được xóa)
        if (article.authorId.toString() !== userId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa bài viết này',
                error: 'FORBIDDEN'
            });
        }

        await Article.findByIdAndDelete(id);

        return res.json({
            success: true,
            message: 'Xóa bài viết thành công'
        });

    } catch (error) {
        console.error('Delete article error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'DocBao API',
            version: '1.0.0',
            description: 'API backend đọc báo',
        },
        servers: [
            { url: 'http://localhost:3000' }
        ],
    },
    apis: ['./src/routes/*.ts'], // hoặc đường dẫn tới file yaml/json
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 