const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initializeDatabase } = require('./models');
const errorMiddleware = require('./middleware/errorMiddleware');
const { authLimiter, topicLimiter, postLimiter, commentLimiter, searchLimiter, generalLimiter } = require('./middleware/rateLimitMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const eventRoutes = require('./routes/eventRoutes');
const jobRoutes = require('./routes/jobRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const dataRoutes = require('./routes/dataRoutes');
const topicRoutes = require('./routes/topicRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const url = 'mongodb://127.0.0.1:27017/forumDB';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiter to all routes
app.use(generalLimiter);

mongoose.connect(url)
    .then(async () => {
        console.log('✓ התחברנו בהצלחה ל-MongoDB!');
        await initializeDatabase();
    })
    .catch((err) => {
        console.error('✗ שגיאה בחיבור ל-MongoDB:', err);
        process.exit(1);
    });

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
// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint לא נמצא' });
});

// Centralized error handler middleware (MUST be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`\n🚀 שרת הפורום פעיל ב-http://localhost:${PORT}`);
    console.log(`📚 API Endpoints:`);
    console.log(`   GET  /api/categories`);
    console.log(`   GET  /api/categories/:categoryId`);
    console.log(`   GET  /api/topics/:topicId`);
    console.log(`   GET  /api/posts/:postId`);
    console.log(`   GET  /api/users`);
    console.log(`   GET  /api/users/:userId`);
    console.log(`   GET  /api/search?q=query&type=topics`);
    console.log(`   GET  /api/statistics`);
    console.log(`   GET  /api/trending`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/google\n`);
});
