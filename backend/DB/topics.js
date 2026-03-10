const mongoose = require('mongoose');
const { userSchema } = require('./users');

const topicSchema = new mongoose.Schema({
    title: String,
    type: String,
    author: userSchema,
    createdAt: Date,
    editedAt: Date,
    votes: Number,
    isPinned: Boolean,
    isClosed: Boolean,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = { Topic, topicSchema };