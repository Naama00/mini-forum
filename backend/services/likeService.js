// backend/services/likeService.js
const { Topic } = require('../models/Topic');
const { Post } = require('../models/Post');
const cache = require('../config/cache');

/**
 * Toggle like on a Topic
 */
async function likeTopic(topicId, userId) {
  const topic = await Topic.findById(topicId);
  if (!topic) throw new Error('נושא לא נמצא');

  const liked = topic.likes?.some(id => id.toString() === userId);
  if (liked) {
    topic.likes.pull(userId);
  } else {
    if (!topic.likes) topic.likes = [];
    topic.likes.push(userId);
  }
  await topic.save();
  await cache.del(`topic:${topicId}`);

  return { likes: topic.likes.length, liked: !liked };
}

/**
 * Toggle like on a Post
 */
async function likePost(postId, userId) {
  const post = await Post.findById(postId);
  if (!post) throw new Error('פוסט לא נמצא');

  const liked = post.likes?.some(id => id.toString() === userId);
  if (liked) {
    post.likes.pull(userId);
  } else {
    if (!post.likes) post.likes = [];
    post.likes.push(userId);
  }
  await post.save();
  if (post.topicId) await cache.del(`topic:${post.topicId.toString()}`);

  return { likes: post.likes.length, liked: !liked };
}

module.exports = { likeTopic, likePost };
