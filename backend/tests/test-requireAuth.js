process.env.JWT_SECRET = 'test-secret';

const { test } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

const requireAuth = require('../middleware/requireAuth');

const JWT_SECRET = process.env.JWT_SECRET;

function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    send(data) { this.body = data; return this; },
  };
}

test('requireAuth middleware rejects a request with no Authorization header', async () => {
  const req = { headers: {} };
  const res = mockRes();
  let nextCalled = false;
  await requireAuth(req, res, () => { nextCalled = true; });
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

test('requireAuth middleware rejects an invalid token', async () => {
  const req = { headers: { authorization: 'Bearer garbage' } };
  const res = mockRes();
  let nextCalled = false;
  await requireAuth(req, res, () => { nextCalled = true; });
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

test('requireAuth middleware accepts a valid token and sets req.userId', async () => {
  const token = jwt.sign({ userId: 'user-1' }, JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockRes();
  let nextCalled = false;
  await requireAuth(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.userId, 'user-1');
});
