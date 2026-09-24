const API_BASE = '/api/notifications';

function authHeaders(token, extra = {}) {
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export async function listNotifications(token) {
  const res = await fetch(API_BASE, { headers: authHeaders(token) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to fetch notifications'); }
  return res.json();
}

export async function markRead(id, token) {
  const res = await fetch(`${API_BASE}/${id}/read`, { method: 'PUT', headers: authHeaders(token) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to mark notification read'); }
  return res.json();
}

export async function markAllRead(token) {
  const res = await fetch(`${API_BASE}/read-all`, { method: 'PUT', headers: authHeaders(token) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to mark all read'); }
  return true;
}
