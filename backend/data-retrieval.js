const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { User, Category, Post, Topic, Upload } = require('./DB/data');

const JWT_SECRET = process.env.JWT_SECRET || 'devhub-secret-key-change-in-production';

function formatPublicUserData(user) {
    if (!user) return null;
    return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        icon: user.icon,
        city: user.city,
        votes: user.votes,
        isActive: user.isActive
    };
}

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'נדרשת התחברות' });
    }
    try {
        const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'טוקן לא תקין' });
    }
}

// ─── GET ─────────────────────────────────────────────────────────────────────

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('subCategories', 'name description icon')
            .select('-__v');
        res.json({ success: true, data: categories, count: categories.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בשליפת קטגוריות', error: error.message });
    }
});

router.get('/categories/:categoryId', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId)
            .populate('subCategories', 'name description icon')
            .select('-__v')
            .lean();

        if (!category) {
            return res.status(404).json({ success: false, message: 'קטגוריה לא נמצאה' });
        }

        // שליפת נושאים ידנית כדי לקבל את author
        const topics = await Topic.find({ _id: { $in: category.topics } })
            .select('title type votes isPinned isClosed createdAt tags posts author')
            .lean();

        // מיון ועיצוב
        const formattedTopics = topics
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(t => ({
                ...t,
                author: formatPublicUserData(t.author)
            }));

        res.json({ success: true, data: { ...category, topics: formattedTopics } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בשליפת קטגוריה', error: error.message });
    }
});

router.get('/topics/:topicId', async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.topicId).select('-__v').lean();

        if (!topic) {
            return res.status(404).json({ success: false, message: 'נושא לא נמצא' });
        }

        // שליפת פוסטים ידנית לפי IDs
        const posts = await Post.find({ _id: { $in: topic.posts } }).lean();

        // מיון לפי תאריך ועיצוב
        const formattedPosts = posts
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map(post => ({
                ...post,
                author: formatPublicUserData(post.author)
            }));

        const result = {
            ...topic,
            author: formatPublicUserData(topic.author),
            posts: formattedPosts
        };

        res.json({ success: true, data: result, postsCount: formattedPosts.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בשליפת נושא', error: error.message });
    }
});

router.get('/posts/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate({ path: 'author', select: 'firstName lastName icon votes city' }) 
            .populate({
                path: 'respondsTo',
                populate: { path: 'author', select: 'firstName lastName icon votes city' }
            })
            .lean(); // חשוב מאוד! הופך את האובייקט ל-Plain JS Object

        if (!post) return res.status(404).json({ success: false, message: 'פוסט לא נמצא' });

        // בדיקה בטרמינל - מה השרת באמת רואה?
        console.log("DEBUG: Post Author after populate:", post.author);

        // עיבוד הנתונים
        if (post.author) {
            post.author = formatPublicUserData(post.author);
        } else {
            console.log("DEBUG: Author is MISSING or NULL for post:", post._id);
        }

        if (post.respondsTo) {
            post.respondsTo = post.respondsTo.map(reply => ({
                ...reply,
                author: reply.author ? formatPublicUserData(reply.author) : null
            }));
        }

        res.json({ success: true, data: post });
    } catch (error) {
        console.error("DEBUG ERROR:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate({ path: 'links.topics', select: 'title votes createdAt', options: { limit: 10 } })
            .populate({ path: 'links.posts', select: 'content numberOfVotes createdAt topicId', options: { limit: 10 } })
            .select('-isAdmin -email -__v');

        if (!user) return res.status(404).json({ success: false, message: 'יוזר לא נמצא' });

        const topics = (user.links?.topics || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const posts = (user.links?.posts || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // חישוב הצבעות אמיתי מסכום הפוסטים והנושאים
        const totalVotes =
            posts.reduce((sum, p) => sum + (p.numberOfVotes || 0), 0) +
            topics.reduce((sum, t) => sum + (t.votes || 0), 0);

        res.json({
            success: true,
            data: { ...formatPublicUserData(user), votes: totalVotes, topics, posts, lastLogin: user.lastLogin, isConnected: user.isConnected }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בשליפת פרטי יוזר', error: error.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ isActive: true })
            .select('firstName lastName icon city votes')
            .sort({ votes: -1 })
            .limit(100);
        res.json({ success: true, data: users, count: users.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בשליפת יוזרים', error: error.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { q, type } = req.query;
        if (!q || q.length < 2) {
            return res.status(400).json({ success: false, message: 'יש להכניס לפחות 2 תווים לחיפוש' });
        }
        const searchRegex = new RegExp(q, 'i');
        const results = {};
        if (!type || type === 'topics') results.topics = await Topic.find({ title: searchRegex }, 'title votes createdAt author').populate('author', 'firstName lastName icon').limit(10);
        if (!type || type === 'posts') results.posts = await Post.find({ content: searchRegex }, 'content numberOfVotes createdAt author').populate('author', 'firstName lastName icon').limit(10);
        if (!type || type === 'categories') results.categories = await Category.find({ $or: [{ name: searchRegex }, { description: searchRegex }] }, 'name description icon').limit(10);
        if (!type || type === 'users') results.users = await User.find({ $or: [{ firstName: searchRegex }, { lastName: searchRegex }] }, 'firstName lastName icon city votes').limit(10);
        res.json({ success: true, data: results, query: q });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בביצוע חיפוש', error: error.message });
    }
});

router.get('/statistics', async (req, res) => {
    try {
        const [usersCount, topicsCount, postsCount, categoriesCount, uploadsCount] = await Promise.all([
            User.countDocuments(), Topic.countDocuments(), Post.countDocuments(),
            Category.countDocuments(), Upload.countDocuments()
        ]);
        const topUsers = await User.find({ isActive: true }).sort({ votes: -1 }).limit(5).select('firstName lastName votes');
        const recentTopics = await Topic.find().sort({ createdAt: -1 }).limit(5).select('title createdAt votes');
        res.json({ success: true, data: { totalUsers: usersCount, totalTopics: topicsCount, totalPosts: postsCount, totalCategories: categoriesCount, totalUploads: uploadsCount, topUsers, recentTopics } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בשליפת סטטיסטיקה', error: error.message });
    }
});

router.get('/trending', async (req, res) => {
    try {
        const trendingTopics = await Topic.find()
            .sort({ votes: -1, createdAt: -1 })
            .limit(20)
            .select('title votes isPinned createdAt author')
            .populate('author', 'firstName lastName icon');
        res.json({ success: true, data: trendingTopics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בשליפת נושאים פופולריים', error: error.message });
    }
});

// ─── POST ────────────────────────────────────────────────────────────────────

router.post('/topics', authMiddleware, async (req, res) => {
    try {
        const { title, content, type, categoryId, tags } = req.body;

        if (!title?.trim()) return res.status(400).json({ success: false, message: 'כותרת חסרה' });
        if (!content?.trim()) return res.status(400).json({ success: false, message: 'תוכן חסר' });
        if (!categoryId) return res.status(400).json({ success: false, message: 'קטגוריה חסרה' });

        const category = await Category.findById(categoryId);
        if (!category) return res.status(404).json({ success: false, message: 'קטגוריה לא נמצאה' });

        const author = await User.findById(req.userId);
        if (!author) return res.status(404).json({ success: false, message: 'משתמש לא נמצא' });

        const firstPost = new Post({
            content: content.trim(),
            numberOfVotes: 0,
            author: author.toObject(),
            createdAt: new Date(),
            isSolution: false,
            respondsTo: []
        });
        await firstPost.save();

        const topic = new Topic({
            title: title.trim(),
            type: type || 'question',
            author: author.toObject(),
            createdAt: new Date(),
            votes: 0,
            isPinned: false,
            isClosed: false,
            posts: [firstPost._id],
            tags: tags || []
        });
        await topic.save();

        await Category.findByIdAndUpdate(categoryId, { $push: { topics: topic._id } });
        await User.findByIdAndUpdate(req.userId, { $push: { 'links.topics': topic._id } });

        res.status(201).json({ success: true, message: 'הנושא נוצר בהצלחה', data: topic });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה ביצירת נושא', error: error.message });
    }
});

router.post('/posts', authMiddleware, async (req, res) => {
    try {
        const { content, topicId } = req.body;

        if (!content?.trim()) return res.status(400).json({ success: false, message: 'תוכן חסר' });
        if (!topicId) return res.status(400).json({ success: false, message: 'topicId חסר' });

        const topic = await Topic.findById(topicId);
        if (!topic) return res.status(404).json({ success: false, message: 'נושא לא נמצא' });

        const author = await User.findById(req.userId);
        if (!author) return res.status(404).json({ success: false, message: 'משתמש לא נמצא' });

        const post = new Post({
            content: content.trim(),
            numberOfVotes: 0,
            author: author.toObject(),
            createdAt: new Date(),
            isSolution: false,
            respondsTo: []
        });
        await post.save();

        await Topic.findByIdAndUpdate(topicId, { $push: { posts: post._id } });
        await User.findByIdAndUpdate(req.userId, { $push: { 'links.posts': post._id } });

        res.status(201).json({
            success: true,
            message: 'התגובה נוספה בהצלחה',
            data: { ...post.toObject(), author: formatPublicUserData(author) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בהוספת תגובה', error: error.message });
    }
});

router.patch('/users/:userId', authMiddleware, async (req, res) => {
    try {
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ success: false, message: 'אין הרשאה לעדכן משתמש זה' });
        }
        const { firstName, lastName, city } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: { firstName, lastName, city } },
            { new: true }
        ).select('-password -isAdmin -email -__v');

        res.json({ success: true, data: formatPublicUserData(updated) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בעדכון פרופיל', error: error.message });
    }
});

router.patch('/posts/:postId', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ success: false, message: 'פוסט לא נמצא' });
        if (post.author._id.toString() !== req.userId)
            return res.status(403).json({ success: false, message: 'אין הרשאה' });

        post.content = req.body.content;
        post.editedAt = new Date();
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בעדכון פוסט', error: error.message });
    }
});

router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ success: false, message: 'פוסט לא נמצא' });
        if (post.author._id.toString() !== req.userId)
            return res.status(403).json({ success: false, message: 'אין הרשאה' });

        await Post.findByIdAndDelete(req.params.postId);

        // הסרה מהנושא
        await Topic.updateMany({}, { $pull: { posts: post._id } });
        // הסרה מהמשתמש
        await User.updateMany({}, { $pull: { 'links.posts': post._id } });

        res.json({ success: true, message: 'פוסט נמחק' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה במחיקת פוסט', error: error.message });
    }
});

router.post('/posts/:postId/vote', authMiddleware, async (req, res) => {
    try {
        const { direction } = req.body; // "up" | "down" | null
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ success: false, message: 'פוסט לא נמצא' });

        const delta = direction === "up" ? 1 : direction === "down" ? -1 : 0;
        post.numberOfVotes = (post.numberOfVotes || 0) + delta;
        await post.save();

        res.json({ success: true, numberOfVotes: post.numberOfVotes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בהצבעה', error: error.message });
    }
});

module.exports = router;