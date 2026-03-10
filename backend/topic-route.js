const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'devhub-secret-key-change-in-production';

// middleware לאימות טוקן
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

// POST /api/topics
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

        // יצירת הפוסט הראשון
        const firstPost = new Post({
            content: content.trim(),
            numberOfVotes: 0,
            author: author.toObject(),
            createdAt: new Date(),
            isSolution: false,
            respondsTo: []
        });
        await firstPost.save();

        // יצירת הנושא
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

        // עדכון הקטגוריה
        await Category.findByIdAndUpdate(categoryId, {
            $push: { topics: topic._id }
        });

        // עדכון רשימת הנושאים של המשתמש
        await User.findByIdAndUpdate(req.userId, {
            $push: { 'links.topics': topic._id }
        });

        res.status(201).json({
            success: true,
            message: 'הנושא נוצר בהצלחה',
            data: topic
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה ביצירת נושא', error: error.message });
    }
});