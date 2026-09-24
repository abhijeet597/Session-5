const mongoose = require('mongoose');
const Group = require('../models/Group');
const GroupMembership = require('../models/GroupMembership');
const Notification = require('../models/Notification');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { allCompletedDates, currentStreak, isAtRisk } = require('../utils/streakUtils');

const MAX_GROUP_SIZE = 10;
const MAX_GROUPS_PER_USER = 5;

async function listGroups(req, res) {
  try {
    const memberships = await GroupMembership.find({ userId: req.userId });
    const groupIds = memberships.map((m) => m.groupId);
    const groups = await Group.find({ _id: { $in: groupIds } });
    const counts = await Promise.all(
      groups.map((g) => GroupMembership.countDocuments({ groupId: g._id }))
    );
    res.json(groups.map((g, i) => ({ ...g.toObject(), memberCount: counts[i] })));
  } catch (err) {
    console.error('listGroups error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createGroup(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const membershipCount = await GroupMembership.countDocuments({ userId: req.userId });
    if (membershipCount >= MAX_GROUPS_PER_USER) {
      return res.status(400).json({ error: `You can belong to at most ${MAX_GROUPS_PER_USER} groups` });
    }
    const group = await Group.create({ name, ownerId: req.userId });
    await GroupMembership.create({ groupId: group._id, userId: req.userId });
    res.status(201).json(group);
  } catch (err) {
    console.error('createGroup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getGroup(req, res) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const membership = await GroupMembership.findOne({ groupId: group._id, userId: req.userId });
    if (!membership) return res.status(403).json({ error: 'You are not a member of this group' });
    const memberships = await GroupMembership.find({ groupId: group._id });
    const userIds = memberships.map((m) => m.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('email');
    const members = memberships.map((m) => {
      const user = users.find((u) => u._id.equals(m.userId));
      return { userId: m.userId, email: user?.email, joinedAt: m.joinedAt };
    });
    res.json({ ...group.toObject(), members });
  } catch (err) {
    console.error('getGroup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteGroup(req, res) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!group.ownerId.equals(req.userId)) return res.status(403).json({ error: 'Only the owner can delete the group' });
    await GroupMembership.deleteMany({ groupId: group._id });
    await Notification.deleteMany({ 'payload.groupId': group._id.toString() });
    await Group.findByIdAndDelete(group._id);
    res.status(204).send();
  } catch (err) {
    console.error('deleteGroup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function addMember(req, res) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!group.ownerId.equals(req.userId)) return res.status(403).json({ error: 'Only the owner can invite members' });
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });
    const invitee = await User.findOne({ email });
    if (!invitee) return res.status(404).json({ error: 'No user with that email' });
    if (invitee._id.equals(req.userId)) return res.status(400).json({ error: 'You cannot invite yourself to your own group' });
    const existing = await GroupMembership.findOne({ groupId: group._id, userId: invitee._id });
    if (existing) return res.status(409).json({ error: 'User is already a member' });
    const inviteeMembershipCount = await GroupMembership.countDocuments({ userId: invitee._id });
    if (inviteeMembershipCount >= MAX_GROUPS_PER_USER) {
      return res.status(400).json({ error: `That user is already in ${MAX_GROUPS_PER_USER} groups` });
    }
    const count = await GroupMembership.countDocuments({ groupId: group._id });
    if (count >= MAX_GROUP_SIZE) return res.status(400).json({ error: `Group is full (max ${MAX_GROUP_SIZE} members)` });
    const membership = await GroupMembership.create({ groupId: group._id, userId: invitee._id });
    res.status(201).json(membership);
  } catch (err) {
    console.error('addMember error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function removeMember(req, res) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const targetId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(targetId)) return res.status(400).json({ error: 'Invalid userId' });
    const isSelf = targetId === req.userId.toString();
    const isOwner = group.ownerId.equals(req.userId);
    if (!isSelf && !isOwner) return res.status(403).json({ error: 'Only the owner can remove other members' });
    const membership = await GroupMembership.findOne({ groupId: group._id, userId: targetId });
    if (!membership) return res.status(404).json({ error: 'Member not found' });
    if (group.ownerId.equals(targetId)) {
      return res.status(400).json({ error: 'Owner cannot leave the group. Delete the group instead.' });
    }
    await GroupMembership.findByIdAndDelete(membership._id);
    res.status(204).send();
  } catch (err) {
    console.error('removeMember error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAtRisk(req, res) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const callerMembership = await GroupMembership.findOne({ groupId: group._id, userId: req.userId });
    if (!callerMembership) return res.status(403).json({ error: 'You are not a member of this group' });
    const memberships = await GroupMembership.find({ groupId: group._id });
    const memberIds = memberships.map((m) => m.userId);
    const users = await User.find({ _id: { $in: memberIds } }).select('email');
    const allHabits = await Habit.find({ userId: { $in: memberIds } });
    const todayStr = new Date().toISOString().slice(0, 10);
    const atRiskMembers = [];
    for (const membership of memberships) {
      const userHabits = allHabits.filter((h) => h.userId.equals(membership.userId));
      const dateSet = allCompletedDates(userHabits);
      const streak = currentStreak(dateSet);
      const atRisk = streak > 0 && !dateSet.has(todayStr);
      if (atRisk) {
        const user = users.find((u) => u._id.equals(membership.userId));
        atRiskMembers.push({ userId: membership.userId, email: user?.email, streak });
      }
    }
    // Fan-out notifications to all members except at-risk members themselves
    for (const atRiskMember of atRiskMembers) {
      for (const membership of memberships) {
        if (membership.userId.equals(atRiskMember.userId)) continue;
        const deduplicationKey = `atRisk:${group._id}:${atRiskMember.userId}:${todayStr}:${membership.userId}`;
        try {
          await Notification.updateOne(
            { recipientId: membership.userId, deduplicationKey },
            {
              $setOnInsert: {
                recipientId: membership.userId,
                type: 'MEMBER_AT_RISK',
                payload: { groupId: group._id.toString(), groupName: group.name, atRiskEmail: atRiskMember.email },
                read: false,
                deduplicationKey,
                createdAt: new Date(),
              },
            },
            { upsert: true }
          );
        } catch {
          // swallow notification errors — don't fail the main response
        }
      }
    }
    res.json(atRiskMembers);
  } catch (err) {
    console.error('getAtRisk error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listGroups, createGroup, getGroup, deleteGroup, addMember, removeMember, getAtRisk };
