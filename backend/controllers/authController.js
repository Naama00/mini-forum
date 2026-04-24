const { registerUser, loginUser, loginWithGoogle } = require('../services/authService');

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
    try {
        const result = await registerUser(req.body);
        res.status(201).json({
            success: true,
            message: 'נרשמת בהצלחה!',
            ...result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.json({
            success: true,
            message: 'התחברת בהצלחה!',
            ...result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/google
 */
async function googleLogin(req, res, next) {
    try {
        const { credential } = req.body;
        const result = await loginWithGoogle(credential);
        res.json({
            success: true,
            message: 'התחברת בהצלחה עם Google!',
            ...result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    googleLogin
};
