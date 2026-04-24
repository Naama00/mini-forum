const searchService = require('../services/searchService');

/**
 * GET /api/search?q=term&type=all&limit=5
 */
async function search(req, res) {
    try {
        const { q, type = 'all', limit = 5 } = req.query;

        const result = await searchService.search(q, type, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    search
};
