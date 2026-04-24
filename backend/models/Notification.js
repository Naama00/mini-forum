const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['comment', 'like', 'attend', 'message'],
    required: true
  },
  // על איזה תוכן — article / event / job
  refModel: { type: String, enum: ['Article', 'Event', 'Job'], default: null },
  refId:    { type: mongoose.Schema.Types.ObjectId, default: null },
  // טקסט חופשי (לhודעה פרטית)
  text:     { type: String, default: '' },
  read:     { type: Boolean, default: false },
}, { timestamps: true });

// אינדקס לשליפה מהירה
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
