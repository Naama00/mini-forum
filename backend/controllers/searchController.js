const searchService = require('../services/searchService');
const { wrapAsync } = require('../utils/controllerFactory');

const search = wrapAsync(async (req, res) => {
    const { q, tag, type = 'all', limit = 5 } = req.query;
    const query = q || tag;
    const result = await searchService.search(query, type, limit);
    res.json(result);
});

module.exports = {
    search
};
