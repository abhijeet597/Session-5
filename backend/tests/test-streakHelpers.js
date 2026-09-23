const { test } = require('node:test');
const assert = require('node:assert');

const { calculateStreak } = require('../controllers/dashboardController');

function daysAgoISO(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

test('calculateStreak returns 0 for a habit with zero completions', () => {
  const result = calculateStreak(new Set());
  assert.strictEqual(result, 0);
});

test('calculateStreak counts consecutive days ending today', () => {
  const dates = new Set([daysAgoISO(0), daysAgoISO(1), daysAgoISO(2)]);
  const result = calculateStreak(dates);
  assert.strictEqual(result, 3);
});
