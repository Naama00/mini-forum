const { User } = require('../models/User');
const cache = require('../config/cache');

/**
 * Format public user data - remove sensitive fields
 */
function formatPublicUserData(user) {
    if (!user) return null;
    return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        icon: user.icon,
        city: user.city,
        votes: user.votes,
        isActive: user.isActive
    };
}

/**
 * Update user profile information
 */
async function updateUser(userId, requestingUserId, updateData) {
    // Verify authorization - user can only update their own profile
    if (userId !== requestingUserId) {
        throw new Error('אין הרשאה לעדכן משתמש זה');
    }

    const { firstName, lastName, city } = updateData;

    const updated = await User.findByIdAndUpdate(
        userId,
        { $set: { firstName, lastName, city } },
        { new: true }
    ).select('-password -isAdmin -email -__v');

    if (!updated) {
        throw new Error('משתמש לא נמצא');
    }

    await cache.del(`user:${userId}`);

    return formatPublicUserData(updated);
}

module.exports = {
    updateUser,
    formatPublicUserData
};
