const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true, maxlength: 80 },
  ownerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

groupSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Group', groupSchema);
