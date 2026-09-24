const { test, mock, afterEach } = require('node:test');
const assert = require('node:assert');

const Notification = require('../models/Notification');
const { listNotifications, markRead, markAllRead } = require('../controllers/notificationController');

function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    send(data) { this.body = data; return this; },
  };
}

afterEach(() => { mock.restoreAll(); });

// --- listNotifications ---

test('listNotifications returns only unread notifications for the caller', async () => {
  const unread = [
    { _id: 'n1', recipientId: 'user-1', read: false, type: 'MEMBER_AT_RISK' },
    { _id: 'n2', recipientId: 'user-1', read: false, type: 'MEMBER_AT_RISK' },
  ];
  // Notification.find returns a chainable query object with .sort().limit()
  mock.method(Notification, 'find', (query) => {
    return {
      sort() { return this; },
      limit() { return Promise.resolve(unread); },
    };
  });
  const res = mockRes();
  await listNotifications({ userId: 'user-1' }, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.length, 2);
  assert.ok(res.body.every((n) => n.read === false));
});

// --- markRead ---

test('markRead returns 404 for unknown notification id', async () => {
  mock.method(Notification, 'findOne', async () => null);
  const res = mockRes();
  await markRead({ userId: 'user-1', params: { id: 'nonexistent' } }, res);
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.error, 'Notification not found');
});

test('markRead sets read:true and returns 200', async () => {
  const fakeNotification = {
    _id: 'n1',
    recipientId: 'user-1',
    read: false,
    save: async function () { return this; },
  };
  mock.method(Notification, 'findOne', async () => fakeNotification);
  const res = mockRes();
  await markRead({ userId: 'user-1', params: { id: 'n1' } }, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(fakeNotification.read, true);
  assert.deepStrictEqual(res.body, fakeNotification);
});

// --- markAllRead ---

test('markAllRead returns 204 and marks all unread as read', async () => {
  let calledWithQuery;
  let calledWithUpdate;
  mock.method(Notification, 'updateMany', async (query, update) => {
    calledWithQuery = query;
    calledWithUpdate = update;
    return { modifiedCount: 3 };
  });
  const res = mockRes();
  await markAllRead({ userId: 'user-1' }, res);
  assert.strictEqual(res.statusCode, 204);
  assert.deepStrictEqual(calledWithQuery, { recipientId: 'user-1', read: false });
  assert.deepStrictEqual(calledWithUpdate, { read: true });
});
