const usageService = require('../services/usageService');

/**
 * GET /api/usage/me
 * Personal stats for the logged-in user
 */
async function getMyUsage(req, res, next) {
    try {
        const data = await usageService.getMyUsage(req.user.userId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/usage/global
 * Forum-wide statistics
 */
async function getGlobalUsage(req, res, next) {
    try {
        const data = await usageService.getGlobalUsage();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

module.exports = { getMyUsage, getGlobalUsage };