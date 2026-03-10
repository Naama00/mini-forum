const mongoose = require('mongoose');
// const { userSchema } = require('./users');

const postSchema = new mongoose.Schema({
    content: String,
    numberOfVotes: Number,
     author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    createdAt: Date,
    editedAt: { type: Date, default: null },
    respondsTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    isSolution: Boolean,
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }
});

const Post = mongoose.model('Post', postSchema);

module.exports = { Post, postSchema };