import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DocBao API',
            version: '1.0.0',
            description: 'API backend đọc báo với Express, TypeScript, MongoDB. Hỗ trợ phân quyền USER và ADMIN.',
        },
        servers: [
            { url: 'http://localhost:3000' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token từ endpoint login. Format: Bearer <token>'
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        },
                        error: {
                            type: 'string',
                            example: 'ERROR_TYPE'
                        }
                    }
                },
                UnauthorizedError: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Access token is required'
                        },
                        error: {
                            type: 'string',
                            example: 'UNAUTHORIZED'
                        }
                    }
                },
                ForbiddenError: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Access denied. Required roles: ADMIN. Your role: USER'
                        },
                        error: {
                            type: 'string',
                            example: 'FORBIDDEN'
                        },
                        requiredRoles: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['ADMIN']
                        },
                        userRole: {
                            type: 'string',
                            example: 'USER'
                        }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.ts'], // Tự động lấy mô tả từ JSDoc trong routes
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions); 