import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '../api.js';

describe('apiFetch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns parsed JSON on a successful GET', async () => {
    const mockData = { habits: [{ _id: '1', name: 'Exercise' }] };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const result = await apiFetch('/api/habits');

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledOnce();
    expect(global.fetch).toHaveBeenCalledWith('/api/habits', expect.objectContaining({
      headers: expect.any(Object),
    }));
  });

  it('throws with the error message from the JSON body on a failed response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Habit not found' }),
    });

    await expect(apiFetch('/api/habits/nonexistent')).rejects.toThrow('Habit not found');
  });

  it('attaches Authorization header when a token is provided', async () => {
    const token = 'my-secret-token';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/api/habits', { token });

    const [, calledOptions] = global.fetch.mock.calls[0];
    expect(calledOptions.headers['Authorization']).toBe(`Bearer ${token}`);
  });

  it('does not add Content-Type header for GET requests', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/api/habits');

    const [, calledOptions] = global.fetch.mock.calls[0];
    expect(calledOptions.headers['Content-Type']).toBeUndefined();
  });
});
