import { useState, useEffect } from 'react';
import { getGroup, addMember, removeMember, getAtRisk, getMemberStreaks } from '../lib/groups';
import { getAuthToken } from '../lib/authApi';

export default function GroupDetail({ groupId, currentUserId, onLeave }) {
  const [group, setGroup] = useState(null);
  const [atRisk, setAtRisk] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');

  async function fetchGroup() {
    const token = getAuthToken();
    try {
      const data = await getGroup(groupId, token);
      setGroup(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchStreaks() {
    const token = getAuthToken();
    try {
      const data = await getMemberStreaks(groupId, token);
      setStreaks(data);
    } catch {
      // non-critical
    }
  }

  useEffect(() => { fetchGroup(); setAtRisk(null); setStreaks(null); fetchStreaks(); }, [groupId]);

  async function handleInvite(e) {
    e.preventDefault();
    const token = getAuthToken();
    try {
      await addMember(groupId, inviteEmail, token);
      setInviteEmail('');
      fetchGroup();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(userId) {
    const token = getAuthToken();
    try {
      await removeMember(groupId, userId, token);
      if (userId === currentUserId) { onLeave(); return; }
      fetchGroup();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCheckAtRisk() {
    const token = getAuthToken();
    try {
      const data = await getAtRisk(groupId, token);
      setAtRisk(data);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!group) return <p>Loading group…</p>;

  const isOwner = group.ownerId?.toString() === currentUserId;

  return (
    <div className="group-detail">
      <h3>{group.name}</h3>
      {error && <p style={{ color: 'var(--color-danger, #e53e3e)' }}>{error}</p>}

      <h4>Members</h4>
      <ul>
        {group.members?.map((m) => {
          const memberStreak = streaks?.find((s) => s.userId?.toString() === m.userId?.toString());
          return (
            <li key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span>{m.email}</span>
              {streaks && (
                <span style={{ fontSize: '0.8rem', color: memberStreak?.streak > 0 ? 'var(--color-primary, #667eea)' : 'var(--color-text-muted, #718096)', fontWeight: 600 }}>
                  🔥 {memberStreak?.streak ?? 0}d
                </span>
              )}
              {(isOwner || m.userId?.toString() === currentUserId) && (
                <button type="button" onClick={() => handleRemove(m.userId?.toString())} style={{ fontSize: '0.75rem' }}>
                  {m.userId?.toString() === currentUserId ? 'Leave' : 'Remove'}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {isOwner && (
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="email"
            placeholder="Invite by email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <button type="submit">Invite</button>
        </form>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button type="button" onClick={handleCheckAtRisk}>Check At-Risk Today</button>
        {atRisk !== null && atRisk.length > 0 && (
          <ul style={{ marginTop: '0.5rem' }}>
            {atRisk.map((m) => (
              <li key={m.userId} style={{ color: 'var(--color-danger, #e53e3e)' }}>
                ⚠ {m.email} — {m.streak} day streak at risk
              </li>
            ))}
          </ul>
        )}
        {atRisk !== null && atRisk.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #718096)', marginTop: '0.5rem' }}>No members at risk today.</p>}
      </div>
    </div>
  );
}
