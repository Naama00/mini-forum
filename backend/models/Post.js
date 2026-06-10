const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: String,
    numberOfVotes: Number,
    author: {
        // store the full user object here (firstName, lastName, icon, _id)
        // some parts of the code create posts/topics with `author: user.toObject()`
        // so allow a Mixed type to persist that object instead of forcing ObjectId
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: Date,
    editedAt: { type: Date, default: null },
    respondsTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    isSolution: Boolean,
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    imageUrl: { type: String, default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Post = mongoose.model('Post', postSchema);

module.exports = { Post, postSchema };
