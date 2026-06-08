const { registerUser, loginUser, loginWithGoogle } = require('../services/authService');
const { wrapAsync } = require('../utils/controllerFactory');
const logger = require('../config/logger');

const register = wrapAsync(async (req, res) => {
    const result = await registerUser(req.body);
    res.status(201).json({
        success: true,
        message: 'נרשמת בהצלחה!',
        ...result
    });
});

const login = wrapAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json({
        success: true,
        message: 'התחברת בהצלחה!',
        ...result
    });
});

const googleLogin = wrapAsync(async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        return res.status(400).json({
            success: false,
            message: 'לא התקבל credential מגוגל'
        });
    }
    const result = await loginWithGoogle(credential);
    logger.info({ userId: result.user._id, icon: result.user.icon }, '✓ Google login response prepared');
    res.json({
        success: true,
        message: 'התחברת בהצלחה עם Google!',
        ...result
    });
});

module.exports = {
    register,
    login,
    googleLogin
};
