const mongoose = require('mongoose');
const { userSchema } = require('./User');

const topicSchema = new mongoose.Schema({
    title: String,
    type: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    author: userSchema,
    createdAt: Date,
    editedAt: Date,
    votes: Number,
    isPinned: Boolean,
    isClosed: Boolean,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    tags: [{ type: String }]
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = { Topic, topicSchema };
