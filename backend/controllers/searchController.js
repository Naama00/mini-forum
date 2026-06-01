const searchService = require('../services/searchService');

/**
 * GET /api/search?q=term&type=all&limit=5
 */
async function search(req, res, next) {
    try {
        const { q, tag, type = 'all', limit = 5 } = req.query;
        const query = q || tag;

        const result = await searchService.search(query, type, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    search
};
