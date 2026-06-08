const userService = require('../services/userService');
const { wrapAsync } = require('../utils/controllerFactory');

const updateUser = wrapAsync(async (req, res) => {
    const data = await userService.updateUser(req.params.userId, req.user.userId, req.body);
    res.json({ success: true, data });
});

module.exports = {
    updateUser
};
