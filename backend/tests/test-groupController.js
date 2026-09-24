const { test, mock, afterEach } = require('node:test');
const assert = require('node:assert');

const Group = require('../models/Group');
const GroupMembership = require('../models/GroupMembership');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { createGroup, addMember, removeMember } = require('../controllers/groupController');

function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    send(data) { this.body = data; return this; },
  };
}

// Helper: build a fake ObjectId-like object whose .equals() compares via toString()
function fakeId(str) {
  return {
    toString() { return str; },
    equals(other) {
      const otherStr = other && typeof other.toString === 'function' ? other.toString() : String(other);
      return str === otherStr;
    },
  };
}

afterEach(() => { mock.restoreAll(); });

// --- createGroup ---

test('createGroup returns 400 if name is missing', async () => {
  const res = mockRes();
  await createGroup({ userId: 'user-1', body: {} }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.error, 'name is required');
});

test('createGroup returns 201 and creates membership for owner', async () => {
  mock.method(GroupMembership, 'countDocuments', async () => 0);
  const groupId = fakeId('group-1');
  mock.method(Group, 'create', async ({ name, ownerId }) => ({ _id: groupId, name, ownerId }));
  let membershipData;
  mock.method(GroupMembership, 'create', async (data) => { membershipData = data; return data; });
  const res = mockRes();
  await createGroup({ userId: 'user-1', body: { name: 'Team Alpha' } }, res);
  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.name, 'Team Alpha');
  assert.ok(membershipData, 'GroupMembership.create should have been called');
  assert.strictEqual(membershipData.userId, 'user-1');
});

test('createGroup returns 400 if user is already in 5 groups', async () => {
  mock.method(GroupMembership, 'countDocuments', async () => 5);
  const res = mockRes();
  await createGroup({ userId: 'user-1', body: { name: 'Sixth Group' } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.ok(res.body.error.includes('5'));
});

// --- addMember ---

test('addMember returns 404 if group not found', async () => {
  mock.method(Group, 'findById', async () => null);
  const res = mockRes();
  await addMember({ userId: 'user-1', params: { id: 'nonexistent' }, body: { email: 'a@b.com' } }, res);
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.error, 'Group not found');
});

test('addMember returns 403 if caller is not owner', async () => {
  const ownerId = fakeId('owner-99');
  mock.method(Group, 'findById', async () => ({ _id: fakeId('group-1'), name: 'G', ownerId }));
  const res = mockRes();
  // caller is 'user-1', owner is 'owner-99'
  await addMember({ userId: 'user-1', params: { id: 'group-1' }, body: { email: 'a@b.com' } }, res);
  assert.strictEqual(res.statusCode, 403);
  assert.ok(res.body.error.includes('owner'));
});

test('addMember returns 400 if self-invite', async () => {
  const callerId = 'user-1';
  const ownerId = fakeId(callerId);
  mock.method(Group, 'findById', async () => ({ _id: fakeId('group-1'), name: 'G', ownerId }));
  // User.findOne returns an invitee whose _id equals callerId
  mock.method(User, 'findOne', async () => ({ _id: fakeId(callerId), email: 'me@example.com' }));
  const res = mockRes();
  await addMember({ userId: callerId, params: { id: 'group-1' }, body: { email: 'me@example.com' } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.ok(res.body.error.includes('yourself'));
});

test('addMember returns 409 if already a member', async () => {
  const callerId = 'user-1';
  const inviteeId = 'user-2';
  const ownerId = fakeId(callerId);
  mock.method(Group, 'findById', async () => ({ _id: fakeId('group-1'), name: 'G', ownerId }));
  mock.method(User, 'findOne', async () => ({ _id: fakeId(inviteeId), email: 'other@example.com' }));
  mock.method(GroupMembership, 'findOne', async () => ({ _id: 'mem-1', groupId: 'group-1', userId: inviteeId }));
  const res = mockRes();
  await addMember({ userId: callerId, params: { id: 'group-1' }, body: { email: 'other@example.com' } }, res);
  assert.strictEqual(res.statusCode, 409);
  assert.ok(res.body.error.includes('already a member'));
});

// --- removeMember ---

test('removeMember returns 204 on success (owner removes another member)', async () => {
  const callerId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
  const targetId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
  const ownerId = fakeId(callerId);
  const groupId = fakeId('cccccccccccccccccccccccc');
  mock.method(Group, 'findById', async () => ({ _id: groupId, name: 'G', ownerId }));
  mock.method(GroupMembership, 'findOne', async () => ({ _id: fakeId('dddddddddddddddddddddddd'), groupId: groupId.toString(), userId: targetId }));
  mock.method(GroupMembership, 'findByIdAndDelete', async () => ({}));
  const res = mockRes();
  await removeMember({ userId: callerId, params: { id: groupId.toString(), userId: targetId } }, res);
  assert.strictEqual(res.statusCode, 204);
});

test('removeMember dissolves group when owner removes themselves', async () => {
  const callerId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
  const ownerId = fakeId(callerId);
  const groupId = fakeId('cccccccccccccccccccccccc');
  mock.method(Group, 'findById', async () => ({ _id: groupId, name: 'G', ownerId }));
  mock.method(GroupMembership, 'findOne', async () => ({ _id: fakeId('dddddddddddddddddddddddd'), groupId: groupId.toString(), userId: callerId }));
  let deletedMemberships = false;
  let deletedNotifications = false;
  let deletedGroup = false;
  mock.method(GroupMembership, 'deleteMany', async () => { deletedMemberships = true; return {}; });
  mock.method(Notification, 'deleteMany', async () => { deletedNotifications = true; return {}; });
  mock.method(Group, 'findByIdAndDelete', async () => { deletedGroup = true; return {}; });
  const res = mockRes();
  await removeMember({ userId: callerId, params: { id: groupId.toString(), userId: callerId } }, res);
  assert.strictEqual(res.statusCode, 204);
  assert.ok(deletedMemberships, 'GroupMembership.deleteMany should have been called');
  assert.ok(deletedNotifications, 'Notification.deleteMany should have been called');
  assert.ok(deletedGroup, 'Group.findByIdAndDelete should have been called');
});
