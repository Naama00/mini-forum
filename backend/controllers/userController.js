const userService = require('../services/userService');

/**
 * PUT /api/users/:userId
 */
async function updateUser(req, res, next) {
    try {
        const data = await userService.updateUser(req.params.userId, req.user.userId, req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    updateUser
};
