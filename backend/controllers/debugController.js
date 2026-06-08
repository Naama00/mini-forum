const cache = require('../config/cache');
const { wrapAsync } = require('../utils/controllerFactory');

const clearCaches = wrapAsync(async (req, res) => {
    const keys = [
        'categories:all',
        'statistics:summary',
        'trending:topics',
    ];

    let deleted = 0;
    for (const k of keys) {
        deleted += await cache.del(k);
    }

    deleted += await cache.invalidate('category:');
    deleted += await cache.invalidate('topic:');

    res.json({ success: true, deleted });
});

module.exports = {
    clearCaches
};
