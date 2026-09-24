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

export async function acceptInvite(inviteId, token) {
  const res = await fetch(`/api/groups/invites/${inviteId}/accept`, { method: 'POST', headers: authHeaders(token) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to accept invite'); }
  return res.json();
}

export async function rejectInvite(inviteId, token) {
  const res = await fetch(`/api/groups/invites/${inviteId}/reject`, { method: 'POST', headers: authHeaders(token) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to reject invite'); }
  return res.json();
}
