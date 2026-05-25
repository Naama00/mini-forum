// Central export for all models
const { User, userSchema } = require('./User');
const Article = require('./Article');
const Event = require('./Event');
const Job = require('./Job');
const Notification = require('./Notification');
const { Category, categorySchema } = require('./Category');
const { Topic, topicSchema } = require('./Topic');
const { Post, postSchema } = require('./Post');
const { Upload, uploadSchema } = require('./Upload');

// יצירת אינדקסים וקולקציות
const logger = require('../logger');

async function initializeDatabase() {
    try {
        // יצירת אינדקסים
        await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        await Category.collection.createIndex({ name: 1 });
        await Post.collection.createIndex({ createdAt: -1 });
        await Topic.collection.createIndex({ title: 1 });
        await Topic.collection.createIndex({ createdAt: -1 });
        await Upload.collection.createIndex({ uploadedAt: -1 });
        
        // Seed categories if empty
        const categoriesCount = await Category.countDocuments();
        if (categoriesCount === 0) {
            const defaultCategories = [
                { name: 'Frontend Development', description: 'React, Vue, Angular וכל הנושאים של Web Frontend', icon: '◇' },
                { name: 'Backend Development', description: 'Node.js, Express, Python וכל הנושאים של Server Side', icon: '◉' },
                { name: 'Mobile Development', description: 'React Native, Flutter, Kotlin וכל הנושאים של Mobile', icon: '◎' },
                { name: 'Cybersecurity', description: 'אבטחה, Penetration Testing, Encryption וכו\'', icon: '◆' },
                { name: 'DevOps & Cloud', description: 'Docker, Kubernetes, AWS, Azure וכו\'', icon: '◈' },
                { name: 'Artificial Intelligence', description: 'Machine Learning, Deep Learning, NLP וכו\'', icon: '◉' },
                { name: 'Data Science', description: 'Data Analysis, BigData, Databases וכו\'', icon: '◑' },
                { name: 'Career & Jobs', description: 'משרות, טיפים לראיון עבודה וקידום קריירה', icon: '◍' }
            ];
            
            await Category.insertMany(defaultCategories);
            logger.info(`✓ ${defaultCategories.length} קטגוריות ברירת מחדל נוצרו`);
        }
        
        logger.info('✓ בסיס הנתונים אותחל בהצלחה!');
        logger.info('✓ כל כולקציות והאינדקסים נוצרו בהצלחה');
    } catch (error) {
        logger.error({ err: error }, 'שגיאה באתחול בסיס הנתונים');
        throw error;
    }
}

module.exports = {
    User,
    userSchema,
    Article,
    Event,
    Job,
    Notification,
    Category,
    categorySchema,
    Topic,
    topicSchema,
    Post,
    postSchema,
    Upload,
    uploadSchema,
    initializeDatabase
};
