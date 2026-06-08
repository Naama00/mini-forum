const http = require('http');
const express = require('express');
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./config/logger');
const pinoHttp = require('pino-http')({ logger });
const { initializeDatabase } = require('./models');
const errorMiddleware = require('./middleware/errorMiddleware');
const { authLimiter, topicLimiter, postLimiter, commentLimiter, searchLimiter, generalLimiter } = require('./middleware/rateLimitMiddleware');
const { connectRedis } = require('./config/cache');
const { initializeNotificationQueue } = require('./queues/notificationQueue');
const notificationEvents = require('./notificationEvents');
const { initSocket, getSocket } = require('./config/socket');

// Routes
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const eventRoutes = require('./routes/eventRoutes');
const jobRoutes = require('./routes/jobRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const dataRoutes = require('./routes/dataRoutes');
const debugRoutes = require('./routes/debugRoutes');
const topicRoutes = require('./routes/topicRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const geminiRoutes = require("./routes/geminiRoutes");
const usageRoutes= require("./routes/usageRoutes");
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

const PORT = process.env.PORT || 5000;
const url = 'mongodb://127.0.0.1:27017/forumDB';

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(pinoHttp);

// Apply general rate limiter only to API routes
app.use('/api', generalLimiter);

async function startServer() {
    try {
        await mongoose.connect(url);
        logger.info('✓ התחברנו בהצלחה ל-MongoDB!');
        await initializeDatabase();
    } catch (err) {
        logger.error({ err }, '✗ שגיאה בחיבור ל-MongoDB');
        process.exit(1);
    }

    let redisClient = null;
    try {
        redisClient = await connectRedis();
    } catch (err) {
        logger.warn({ err }, 'Redis cache disabled; continuing without Redis');
    }

    if (redisClient) {
        try {
            await initializeNotificationQueue();
        } catch (err) {
            logger.warn({ err }, 'Notification queue unavailable; background jobs disabled');
        }
    } else {
        logger.warn('Skipping notification queue initialization because Redis is unavailable');
    }

    server.listen(PORT, () => {
        logger.info({ port: PORT }, '🚀 שרת הפורום פעיל');
        logger.info('🚀 WebSocket support enabled');
        logger.info('📚 API Endpoints:');
        logger.info('   GET  /api/categories');
        logger.info('   GET  /api/categories/:categoryId');
        logger.info('   GET  /api/topics/:topicId');
        logger.info('   GET  /api/posts/:postId');
        logger.info('   GET  /api/users');
        logger.info('   GET  /api/users/:userId');
        logger.info('   GET  /api/search?q=query&type=topics');
        logger.info('   GET  /api/statistics');
        logger.info('   GET  /api/trending');
        logger.info('   POST /api/auth/register');
        logger.info('   POST /api/auth/login');
        logger.info('   POST /api/auth/google');
        logger.info('   POST /api/uploads');
    });
}

notificationEvents.on('notificationCreated', (notification) => {
    const recipientId = notification.recipient?.toString?.();
    if (!recipientId) return;
    io.to(`user:${recipientId}`).emit('notification', notification);
});

startServer();

// Routes with rate limiting
app.use('/api/search', searchLimiter, searchRoutes);

app.use('/api/auth', authLimiter, authRoutes);  

app.get('/health', (req, res) => {
    res.json({ status: 'Server is running ✓' });
});

app.use('/api/articles', articleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/topics', topicLimiter, topicRoutes);
app.use('/api/posts', postLimiter, postRoutes);
app.use('/api/users', userRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api', dataRoutes);
app.use("/api/gemini", geminiRoutes);
app.use('/api/usage',usageRoutes);
app.use('/api/uploads', uploadRoutes);
// Debug routes (only enabled in non-production)
if (process.env.NODE_ENV !== 'production') {
    app.use('/api/debug', debugRoutes);
}
// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint לא נמצא' });
});

// Centralized error handler middleware (MUST be last)
app.use(errorMiddleware);
