const mongoose = require('mongoose');
const { User, userSchema } = require('./users');
const { Category, categorySchema } = require('./categories');
const { Post, postSchema } = require('./posts');
const { Topic, topicSchema } = require('./topics');
const { Upload, uploadSchema } = require('./uploads');

const dataSchema = new mongoose.Schema({
    users: [userSchema],
    topics: [topicSchema],
    posts: [postSchema],
    categories: [categorySchema],
    uploads: [uploadSchema]
});

const Data = mongoose.model('Data', dataSchema);

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

module.exports = { Data, User, Category, Post, Topic, Upload, initializeDatabase };