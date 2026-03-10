const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initializeDatabase } = require('./DB/data');
const dataRetrieval = require('./data-retrieval');
const authRoutes = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;
const url = 'mongodb://127.0.0.1:27017/forumDB';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(url)
    .then(async () => {
        console.log('✓ התחברנו בהצלחה ל-MongoDB!');
        await initializeDatabase();
    })
    .catch((err) => {
        console.error('✗ שגיאה בחיבור ל-MongoDB:', err);
        process.exit(1);
    });

// Routes
app.use('/api', dataRetrieval);
app.use('/api/auth', authRoutes);  // ← חדש

app.get('/health', (req, res) => {
    res.json({ status: 'Server is running ✓' });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint לא נמצא' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
});

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