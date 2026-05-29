const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models/User');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET || 'devhub-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = '151921932655-85p00136srh9nb2tquam8qkkjtuvfnl5.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Register a new user with email and password
 */
async function registerUser(userData) {
    const { firstName, lastName, email, password, city } = userData;

    if (!firstName || !lastName || !email || !password) {
        throw new Error('יש למלא את כל השדות החובה');
    }

    const existing = await User.findOne({ email });
    if (existing) {
        throw new Error('כתובת המייל כבר רשומה במערכת');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        city: city || '',
        isActive: true,
        isVerifiedEmail: false,
        votes: 0,
        isAdmin: false,
        isConnected: true,
        lastLogin: new Date(),
        links: { topics: [], posts: [], uploads: [] }
    });

    await user.save();

    // const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
const token = jwt.sign({ userId: user._id }, 'my-super-secret-local-key-123', { expiresIn: '7d' });
    return {
        token,
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            icon: user.icon
        }
    };
}

/**
 * Login user with email and password
 */
async function loginUser(email, password) {
    if (!email || !password) {
        throw new Error('יש להזין מייל וסיסמה');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('המייל אינו קיים במערכת');
    }

    if (!user.password) {
        throw new Error('חשבון זה משתמש בכניסה עם Google');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error('הסיסמה שגויה');
    }

    user.lastLogin = new Date();
    user.isConnected = true;
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return {
        token,
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            icon: user.icon
        }
    };
}

/**
 * Google login
 */
async function loginWithGoogle(credential) {
    if (!credential) {
        throw new Error('לא התקבל credential מגוגל');
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    logger.info({ email, given_name, family_name, picture }, '🔐 Google login payload received');

    let user = await User.findOne({ email });

    if (!user) {
        // Create new user automatically
        logger.info({ email, picture }, '👤 Creating new user from Google');
        user = new User({
            firstName: given_name || '',
            lastName: family_name || '',
            email,
            icon: picture || '',
            isActive: true,
            isVerifiedEmail: true,
            votes: 0,
            isAdmin: false,
            isConnected: true,
            lastLogin: new Date(),
            links: { topics: [], posts: [], uploads: [] }
        });
        await user.save();
        logger.info({ userId: user._id, icon: user.icon }, '✅ New user created with icon');
    } else {
        logger.info({ userId: user._id, oldIcon: user.icon, newIcon: picture }, '🔄 Existing user found, updating');
        user.lastLogin = new Date();
        user.isConnected = true;
        // Only update icon if Google provides a new picture
        if (picture) {
            user.icon = picture;
            logger.info({ userId: user._id, icon: user.icon }, '🖼️  Icon updated from Google');
        } else {
            logger.warn({ userId: user._id }, '⚠️  No picture from Google, keeping existing icon');
        }
        await user.save();
        logger.info({ userId: user._id, iconAfterSave: user.icon }, '✅ User updated in database');
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return {
        token,
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            icon: user.icon
        }
    };
}

module.exports = {
    registerUser,
    loginUser,
    loginWithGoogle
};
