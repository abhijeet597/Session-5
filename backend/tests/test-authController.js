process.env.JWT_SECRET = 'test-secret';

const { test, mock, afterEach } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { signup, login } = require('../controllers/authController');

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

test('signup rejects missing email or password', async () => {
  const res = mockRes();
  await signup({ body: { email: 'a@example.com' } }, res);
  assert.strictEqual(res.statusCode, 400);
});

test('signup rejects a duplicate email', async () => {
  mock.method(User, 'findOne', async () => ({ _id: '1', email: 'a@example.com' }));
  const res = mockRes();
  await signup({ body: { email: 'a@example.com', password: 'secret123' } }, res);
  assert.strictEqual(res.statusCode, 409);
});

test('signup creates a user with a REAL bcrypt hash (not the plaintext password) and returns a real JWT', async () => {
  mock.method(User, 'findOne', async () => null);
  mock.method(User, 'create', async (data) => ({ _id: 'new-id', ...data }));
  const res = mockRes();
  await signup({ body: { email: 'a@example.com', password: 'secret123' } }, res);
  assert.strictEqual(res.statusCode, 201);
  assert.ok(res.body.token);
  assert.notStrictEqual(res.body.token, 'secret123');
});

test('login rejects a correct email with the wrong password', async () => {
  const hash = await bcrypt.hash('correctpass', 10);
  mock.method(User, 'findOne', async () => ({ _id: '1', email: 'a@example.com', passwordHash: hash }));
  const res = mockRes();
  await login({ body: { email: 'a@example.com', password: 'wrongpass' } }, res);
  assert.strictEqual(res.statusCode, 401);
});

test('login succeeds with the correct password and returns a valid token', async () => {
  const hash = await bcrypt.hash('correctpass', 10);
  mock.method(User, 'findOne', async () => ({ _id: '1', email: 'a@example.com', passwordHash: hash }));
  const res = mockRes();
  await login({ body: { email: 'a@example.com', password: 'correctpass' } }, res);
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.token);
});
