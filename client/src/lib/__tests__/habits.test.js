import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getHabits,
  addHabit,
  deleteHabit,
  updateHabit,
  checkInHabit,
  getCategories,
  addCategory,
} from '../habits.js';

const TOKEN = 'test-token-abc';

function mockFetch(status, body) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── getHabits ────────────────────────────────────────────────────────────────

describe('getHabits', () => {
  it('sends GET /api/habits with Authorization header when token provided', async () => {
    const habits = [{ _id: '1', name: 'Run' }];
    vi.stubGlobal('fetch', mockFetch(200, habits));

    const result = await getHabits(TOKEN);

    expect(fetch).toHaveBeenCalledOnce();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/habits');
    expect(options.headers).toMatchObject({
      Authorization: `Bearer ${TOKEN}`,
    });
    expect(result).toEqual(habits);
  });

  it('does NOT add Authorization header when token is falsy', async () => {
    const habits = [];
    vi.stubGlobal('fetch', mockFetch(200, habits));

    await getHabits(null);

    const [, options] = fetch.mock.calls[0];
    expect(options.headers).not.toHaveProperty('Authorization');
  });

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetch(401, { error: 'Unauthorized' }));

    await expect(getHabits(TOKEN)).rejects.toThrow('Unauthorized');
  });
});

// ─── addHabit ─────────────────────────────────────────────────────────────────

describe('addHabit', () => {
  it('sends POST /api/habits with correct JSON body and auth header', async () => {
    const newHabit = { _id: '42', name: 'Meditate', category: 'Health', frequency: 'daily' };
    vi.stubGlobal('fetch', mockFetch(201, newHabit));

    const result = await addHabit('Meditate', 'Health', 'daily', null, TOKEN);

    expect(fetch).toHaveBeenCalledOnce();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/habits');
    expect(options.method).toBe('POST');
    expect(options.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    });
    expect(JSON.parse(options.body)).toEqual({
      name: 'Meditate',
      category: 'Health',
      frequency: 'daily',
      dayOfMonth: null,
    });
    expect(result).toEqual(newHabit);
  });

  it('includes dayOfMonth in body when provided', async () => {
    vi.stubGlobal('fetch', mockFetch(201, { _id: '99' }));

    await addHabit('Pay bills', 'Finance', 'monthly', 15, TOKEN);

    const [, options] = fetch.mock.calls[0];
    expect(JSON.parse(options.body).dayOfMonth).toBe(15);
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch(400, { error: 'Name is required' }));

    await expect(addHabit('', 'Health', 'daily', null, TOKEN)).rejects.toThrow('Name is required');
  });
});

// ─── deleteHabit ──────────────────────────────────────────────────────────────

describe('deleteHabit', () => {
  it('sends DELETE /api/habits/:id with auth header', async () => {
    vi.stubGlobal('fetch', mockFetch(204, {}));

    const result = await deleteHabit('habit-123', TOKEN);

    expect(fetch).toHaveBeenCalledOnce();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/habits/habit-123');
    expect(options.method).toBe('DELETE');
    expect(options.headers).toMatchObject({
      Authorization: `Bearer ${TOKEN}`,
    });
    expect(result).toBe(true);
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch(404, { error: 'Habit not found' }));

    await expect(deleteHabit('bad-id', TOKEN)).rejects.toThrow('Habit not found');
  });

  it('throws with default message when error body has no error field', async () => {
    vi.stubGlobal('fetch', mockFetch(500, {}));

    await expect(deleteHabit('id', TOKEN)).rejects.toThrow('Failed to delete habit');
  });
});

// ─── updateHabit ──────────────────────────────────────────────────────────────

describe('updateHabit', () => {
  it('sends PUT /api/habits/:id with fields object', async () => {
    const updated = { _id: '1', frequency: 'weekly' };
    vi.stubGlobal('fetch', mockFetch(200, updated));

    const result = await updateHabit('1', { frequency: 'weekly' }, TOKEN);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/habits/1');
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual({ frequency: 'weekly' });
    expect(result).toEqual(updated);
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch(404, { error: 'Not found' }));

    await expect(updateHabit('bad', {}, TOKEN)).rejects.toThrow('Not found');
  });
});

// ─── checkInHabit ─────────────────────────────────────────────────────────────

describe('checkInHabit', () => {
  it('sends PUT with completedDates array', async () => {
    const updated = { _id: '1', completedDates: ['2026-09-23'] };
    vi.stubGlobal('fetch', mockFetch(200, updated));

    const result = await checkInHabit('1', ['2026-09-23'], TOKEN);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/habits/1');
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual({ completedDates: ['2026-09-23'] });
    expect(result).toEqual(updated);
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch(500, { error: 'Server error' }));

    await expect(checkInHabit('1', [], TOKEN)).rejects.toThrow('Server error');
  });
});

// ─── getCategories ────────────────────────────────────────────────────────────

describe('getCategories', () => {
  it('sends GET /api/categories with Authorization header', async () => {
    const cats = [{ _id: 'c1', name: 'Health' }];
    vi.stubGlobal('fetch', mockFetch(200, cats));

    const result = await getCategories(TOKEN);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/categories');
    expect(options.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` });
    expect(result).toEqual(cats);
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch(403, { error: 'Forbidden' }));

    await expect(getCategories(TOKEN)).rejects.toThrow('Forbidden');
  });
});

// ─── addCategory ──────────────────────────────────────────────────────────────

describe('addCategory', () => {
  it('sends POST /api/categories with correct body', async () => {
    const cat = { _id: 'c2', name: 'Fitness' };
    vi.stubGlobal('fetch', mockFetch(201, cat));

    const result = await addCategory('Fitness', TOKEN);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/categories');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ name: 'Fitness' });
    expect(options.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    });
    expect(result).toEqual(cat);
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch(400, { error: 'Name required' }));

    await expect(addCategory('', TOKEN)).rejects.toThrow('Name required');
  });
});
