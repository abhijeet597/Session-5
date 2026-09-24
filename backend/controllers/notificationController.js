const Notification = require('../models/Notification');

async function listNotifications(req, res) {
  try {
    const notifications = await Notification.find({ recipientId: req.userId, read: false })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error('listNotifications error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function markRead(req, res) {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipientId: req.userId });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error('markRead error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ recipientId: req.userId, read: false }, { read: true });
    res.status(204).send();
  } catch (err) {
    console.error('markAllRead error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listNotifications, markRead, markAllRead };
