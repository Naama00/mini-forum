const usageService = require('../services/usageService');
const { wrapAsync } = require('../utils/controllerFactory');

const getMyUsage = wrapAsync(async (req, res) => {
    const data = await usageService.getMyUsage(req.user.userId);
    res.json({ success: true, data });
});

const getGlobalUsage = wrapAsync(async (req, res) => {
    const data = await usageService.getGlobalUsage();
    res.json({ success: true, data });
});

module.exports = { getMyUsage, getGlobalUsage };
