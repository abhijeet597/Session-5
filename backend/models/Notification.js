const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:             { type: String, required: true, enum: ['MEMBER_AT_RISK'] },
  payload:          { type: mongoose.Schema.Types.Mixed },
  read:             { type: Boolean, default: false },
  deduplicationKey: { type: String, required: true },
  createdAt:        { type: Date, default: Date.now },
});

notificationSchema.index({ recipientId: 1, deduplicationKey: 1 }, { unique: true });
notificationSchema.index({ recipientId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
