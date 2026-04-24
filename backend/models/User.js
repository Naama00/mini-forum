const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    password: String, 
    icon: String,
    email: String,
    isVerifiedEmail: Boolean,
    city: String,
    isActive: Boolean,
    votes: Number,
    links: {
        topics: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic'
        }],
        posts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }],
        uploads: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Upload'
        }]
    },
    lastLogin: Date,
    isConnected: Boolean,
    isAdmin: Boolean
});

const User = mongoose.model('User', userSchema);

module.exports = { User, userSchema };
