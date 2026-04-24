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
async function initializeDatabase() {
    try {
        // יצירת אינדקסים
        await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        await Category.collection.createIndex({ name: 1 });
        await Post.collection.createIndex({ createdAt: -1 });
        await Topic.collection.createIndex({ title: 1 });
        await Topic.collection.createIndex({ createdAt: -1 });
        await Upload.collection.createIndex({ uploadedAt: -1 });
        
        console.log('✓ בסיס הנתונים אותחל בהצלחה!');
        console.log('✓ כל כולקציות והאינדקסים נוצרו בהצלחה');
    } catch (error) {
        console.error('שגיאה באתחול בסיס הנתונים:', error);
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
