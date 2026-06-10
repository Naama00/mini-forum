const { Post } = require('../models/Post');
const { Topic } = require('../models/Topic');
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
 * Create a new post in a topic
 */
async function createPost(content, topicId, userId, imageUrl) {
    if (!content?.trim()) {
        throw new Error('תוכן חסר');
    }

    if (!topicId) {
        throw new Error('topicId חסר');
    }

    // Verify topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new Error('נושא לא נמצא');
    }

    // Verify author exists
    const author = await User.findById(userId);
    if (!author) {
        throw new Error('משתמש לא נמצא');
    }

    // Create post
    const post = new Post({
        content: content.trim(),
        numberOfVotes: 0,
        author: author.toObject(),
        topicId,
        createdAt: new Date(),
        isSolution: false,
        respondsTo: [],
        imageUrl: imageUrl || null
    });
    await post.save();

    // Link post to topic and user
    await Topic.findByIdAndUpdate(topicId, { $push: { posts: post._id } });
    await User.findByIdAndUpdate(userId, { $push: { 'links.posts': post._id } });

    await cache.del(`user:${userId}`);
    await cache.del(`topic:${topicId}`);

    return {
        success: true,
        message: 'התגובה נוספה בהצלחה',
        data: {
            ...post.toObject(),
            author: formatPublicUserData(author)
        }
    };
}

/**
 * Update a post
 */
async function updatePost(postId, updateData, userId) {
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error('פוסט לא נמצא');
    }

    // Verify authorization - only author can edit
    if (post.author._id.toString() !== userId) {
        throw new Error('אין הרשאה');
    }

    post.content = updateData.content;
    post.editedAt = new Date();
    await post.save();

    return {
        success: true,
        data: post
    };
}

/**
 * Delete a post
 */
async function deletePost(postId, userId, isAdmin = false) {
  const post = await Post.findById(postId);
  if (!post) throw new Error('פוסט לא נמצא');

  // ✅ תומך בכל הפורמטים של author
  const authorId = post.author?._id?.toString() || post.author?.id?.toString() || post.author?.toString();
  if (!isAdmin && authorId !== userId) throw new Error('אין הרשאה');

  await Post.findByIdAndDelete(postId);
  await Topic.updateMany({}, { $pull: { posts: post._id } });
  await User.updateMany({}, { $pull: { 'links.posts': post._id } });
  await cache.del(`user:${authorId}`);
  if (post.topicId) await cache.del(`topic:${post.topicId.toString()}`);

  return { success: true, message: 'פוסט נמחק' };
}

/**
 * Vote on a post (up/down/neutral)
 */
async function votePost(postId, direction, userId) {
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error('פוסט לא נמצא');
    }

    // Calculate delta based on direction
    const delta = direction === 'up' ? 1 : direction === 'down' ? -1 : 0;
    post.numberOfVotes = (post.numberOfVotes || 0) + delta;
    await post.save();

    // Reward user if upvoted
    if (direction === 'up') {
        await User.findByIdAndUpdate(
            post.author._id,
            { $inc: { votes: 1 } },
            { new: true }
        );
    }

    return {
        success: true,
        data: post
    };
}
const likeService = require('../services/likeService');

async function likePost(req, res, next) {
  try {
    const result = await likeService.likePost(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) { next(err); }
}


module.exports = {
    createPost,
    updatePost,
    deletePost,
    votePost,
    formatPublicUserData,
    likePost
};
