import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

// Import MongoDB connection
import { connectDB, disconnectDB } from './db/mongo';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Test endpoint để debug
app.post('/test-simple', (req, res) => {
    try {
        console.log('Test endpoint called');
        res.json({
            success: true,
            message: 'Test endpoint working',
            body: req.body
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Test endpoint error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'DocBao API is running'
    });
});

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const isConnected = mongoose.connection.readyState === 1;

        if (isConnected) {
            res.json({
                status: 'OK',
                message: 'MongoDB connection successful',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                status: 'ERROR',
                message: 'MongoDB connection failed',
                error: 'Database not connected'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'MongoDB connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🗄️  Database test: http://localhost:${PORT}/test-db`);
            console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
            console.log(`🧪 Test endpoint: http://localhost:${PORT}/test-simple`);
            console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await disconnectDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await disconnectDB();
    process.exit(0);
}); 