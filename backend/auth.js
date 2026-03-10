const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('./DB/data');

const JWT_SECRET = process.env.JWT_SECRET || 'devhub-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = '151921932655-85p00136srh9nb2tquam8qkkjtuvfnl5.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, city } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: 'יש למלא את כל השדות החובה' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'כתובת המייל כבר רשומה במערכת' });
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

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            message: 'נרשמת בהצלחה!',
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                icon: user.icon
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בהרשמה', error: error.message });
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'יש להזין מייל וסיסמה' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'המייל או הסיסמה שגויים' });
        }

        if (!user.password) {
            return res.status(401).json({ success: false, message: 'חשבון זה משתמש בכניסה עם Google' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'המייל או הסיסמה שגויים' });
        }

        user.lastLogin = new Date();
        user.isConnected = true;
        await user.save();

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            message: 'התחברת בהצלחה!',
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                icon: user.icon
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בהתחברות', error: error.message });
    }
});

// ─── POST /api/auth/google ────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: 'לא התקבל credential מגוגל' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // משתמש חדש — יצירה אוטומטית
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
        } else {
            user.lastLogin = new Date();
            user.isConnected = true;
            user.icon = picture || user.icon;
            await user.save();
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            message: 'התחברת בהצלחה עם Google!',
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                icon: user.icon
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'שגיאה בכניסה עם Google', error: error.message });
    }
});

module.exports = router;