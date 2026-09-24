const API_BASE = '/api/groups';

function authHeaders(token, extra = {}) {
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export async function listGroups(token) {
  const res = await fetch(API_BASE, { headers: authHeaders(token) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to fetch groups'); }
  return res.json();
}

export async function createGroup(name, token) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to create group'); }
  return res.json();
}

export async function getGroup(id, token) {
  const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders(token) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to fetch group'); }
  return res.json();
}

export async function deleteGroup(id, token) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: authHeaders(token) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to delete group'); }
  return true;
}

export async function addMember(groupId, email, token) {
  const res = await fetch(`${API_BASE}/${groupId}/members`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email }),
  });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to add member'); }
  return res.json();
}

export async function removeMember(groupId, userId, token) {
  const res = await fetch(`${API_BASE}/${groupId}/members/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to remove member'); }
  return true;
}

export async function getAtRisk(groupId, token) {
  const res = await fetch(`${API_BASE}/${groupId}/at-risk`, { headers: authHeaders(token) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to fetch at-risk members'); }
  return res.json();
}
