const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    filename: String,
    type: String,
    size: Number,
    url: String,
    uploadedAt: Date,
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Upload = mongoose.model('Upload', uploadSchema);

module.exports = { Upload, uploadSchema };