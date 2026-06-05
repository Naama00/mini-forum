const cache = require('../config/cache');

async function clearCaches(req, res, next) {
    try {
        const keys = [
            'categories:all',
            'statistics:summary',
            'trending:topics',
        ];

        let deleted = 0;
        for (const k of keys) {
            deleted += await cache.del(k);
        }

        // also allow prefix invalidation
        deleted += await cache.invalidate('category:');
        deleted += await cache.invalidate('topic:');

        res.json({ success: true, deleted });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    clearCaches
};
