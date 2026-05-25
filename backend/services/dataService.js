const { User, Category, Topic, Upload } = require('../models');
const { Post } = require('../models/Post');
const logger = require('../logger');
const cache = require('../cache');

const CACHE_KEYS = {
    categories: 'categories:all',
    statistics: 'statistics:summary',
    trendingTopics: 'trending:topics'
};

const CACHE_PREFIX = {
    category: 'category:',
    topic: 'topic:',
    post: 'post:',
    user: 'user:'
};

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
 * Get all categories with sub-categories
 */
async function getCategories() {
    logger.debug('getCategories called');
    try {
        const cacheKey = CACHE_KEYS.categories;
        const cached = await cache.get(cacheKey);
        if (cached) {
            logger.debug({ key: cacheKey }, 'Redis cache hit for categories');
            return cached;
        }

        const categories = await Category.find()
            .populate('subCategories', 'name description icon')
            .select('-__v')
            .lean();

        const result = {
            success: true,
            data: categories,
            count: categories.length
        };

        await cache.set(cacheKey, result, 300);
        logger.debug({ count: categories.length }, 'Found categories');
        return result;
    } catch (error) {
        logger.error({ err: error }, 'Error in getCategories');
        throw error;
    }
}

/**
 * Get category by ID with topics
 */
async function getCategoryById(categoryId) {
    const cacheKey = `${CACHE_PREFIX.category}${categoryId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        logger.debug({ key: cacheKey }, 'Redis cache hit for category');
        return cached;
    }

    const category = await Category.findById(categoryId)
        .populate('subCategories', 'name description icon')
        .select('-__v')
        .lean();

    if (!category) {
        throw new Error('קטגוריה לא נמצאה');
    }

    const topics = await Topic.find({ _id: { $in: category.topics } })
        .select('title type votes isPinned isClosed createdAt tags posts author')
        .lean();

    const formattedTopics = topics
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(t => ({
            ...t,
            author: formatPublicUserData(t.author)
        }));

    const result = {
        success: true,
        data: { ...category, topics: formattedTopics }
    };

    await cache.set(cacheKey, result, 300);
    return result;
}

/**
 * Get topic by ID with posts
 */
async function getTopicById(topicId) {
    const cacheKey = `${CACHE_PREFIX.topic}${topicId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        logger.debug({ key: cacheKey }, 'Redis cache hit for topic');
        return cached;
    }

    const topic = await Topic.findById(topicId)
        .select('-__v')
        .populate('category', 'name _id')
        .lean();

    if (!topic) {
        throw new Error('נושא לא נמצא');
    }

    const posts = await Post.find({ _id: { $in: topic.posts } }).lean();

    const formattedPosts = posts
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(post => ({
            ...post,
            author: formatPublicUserData(post.author)
        }));

    const result = {
        ...topic,
        author: formatPublicUserData(topic.author),
        posts: formattedPosts
    };

    const response = {
        success: true,
        data: result,
        postsCount: formattedPosts.length
    };

    await cache.set(cacheKey, response, 300);
    return response;
}

/**
 * Get post by ID with replies
 */
async function getPostById(postId) {
    const cacheKey = `${CACHE_PREFIX.post}${postId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        logger.debug({ key: cacheKey }, 'Redis cache hit for post');
        return cached;
    }

    const post = await Post.findById(postId)
        .populate({ path: 'author', select: 'firstName lastName icon votes city' })
        .populate({
            path: 'respondsTo',
            populate: { path: 'author', select: 'firstName lastName icon votes city' }
        })
        .lean();

    if (!post) {
        throw new Error('פוסט לא נמצא');
    }

    if (post.author) {
        post.author = formatPublicUserData(post.author);
    }

    if (post.respondsTo) {
        post.respondsTo = post.respondsTo.map(reply => ({
            ...reply,
            author: reply.author ? formatPublicUserData(reply.author) : null
        }));
    }

    const response = {
        success: true,
        data: post
    };

    await cache.set(cacheKey, response, 300);
    return response;
}

/**
 * Get user profile by ID
 */
async function getUserById(userId) {
    const cacheKey = `${CACHE_PREFIX.user}${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        logger.debug({ key: cacheKey }, 'Redis cache hit for user');
        return cached;
    }

    const user = await User.findById(userId)
        .populate({ path: 'links.topics', select: 'title votes createdAt', options: { limit: 10 } })
        .populate({ path: 'links.posts', select: 'content numberOfVotes createdAt topicId', options: { limit: 10 } })
        .select('-isAdmin -email -__v')
        .lean();

    if (!user) {
        throw new Error('יוזר לא נמצא');
    }

    logger.debug({ userId, icon: user.icon }, '📦 User loaded from DB');

    const topics = (user.links?.topics || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const posts = (user.links?.posts || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalVotes =
        posts.reduce((sum, p) => sum + (p.numberOfVotes || 0), 0) +
        topics.reduce((sum, t) => sum + (t.votes || 0), 0);

    const response = {
        success: true,
        data: {
            ...formatPublicUserData(user),
            votes: totalVotes,
            topics,
            posts,
            lastLogin: user.lastLogin,
            isConnected: user.isConnected
        }
    };

    logger.debug({ userId, iconInResponse: response.data.icon }, '📮 User response prepared');
    await cache.set(cacheKey, response, 300);
    return response;
}

/**
 * Get all active users (top by votes)
 */
async function getAllUsers() {
    const users = await User.find({ isActive: true })
        .select('firstName lastName icon city votes')
        .sort({ votes: -1 })
        .limit(100);

    return {
        success: true,
        data: users,
        count: users.length
    };
}

/**
 * Get statistics: counts and trending data
 */
async function getStatistics() {
    const cacheKey = CACHE_KEYS.statistics;
    const cached = await cache.get(cacheKey);
    if (cached) {
        logger.debug({ key: cacheKey }, 'Redis cache hit for statistics');
        return cached;
    }

    const [usersCount, topicsCount, postsCount, categoriesCount, uploadsCount] = await Promise.all([
        User.countDocuments(),
        Topic.countDocuments(),
        Post.countDocuments(),
        Category.countDocuments(),
        Upload.countDocuments()
    ]);

    const topUsers = await User.find({ isActive: true })
        .sort({ votes: -1 })
        .limit(5)
        .select('firstName lastName votes');

    const recentTopics = await Topic.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt votes');

    const response = {
        success: true,
        data: {
            totalUsers: usersCount,
            totalTopics: topicsCount,
            totalPosts: postsCount,
            totalCategories: categoriesCount,
            totalUploads: uploadsCount,
            topUsers,
            recentTopics
        }
    };

    await cache.set(cacheKey, response, 60);
    return response;
}

/**
 * Get trending topics
 */
async function getTrendingTopics() {
    const cacheKey = CACHE_KEYS.trendingTopics;
    const cached = await cache.get(cacheKey);
    if (cached) {
        logger.debug({ key: cacheKey }, 'Redis cache hit for trending topics');
        return cached;
    }

    const trendingTopics = await Topic.find()
        .sort({ votes: -1, createdAt: -1 })
        .limit(20)
        .select('title votes isPinned createdAt author')
        .populate('author', 'firstName lastName icon')
        .lean();

    const response = {
        success: true,
        data: trendingTopics
    };

    await cache.set(cacheKey, response, 120);
    return response;
}

module.exports = {
    getCategories,
    getCategoryById,
    getTopicById,
    getPostById,
    getUserById,
    getAllUsers,
    getStatistics,
    getTrendingTopics,
    formatPublicUserData
};
