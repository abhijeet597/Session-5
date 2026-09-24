import { useState, useEffect } from 'react';
import { listGroups, createGroup, deleteGroup } from '../lib/groups';
import { getAuthToken } from '../lib/authApi';
import GroupDetail from './GroupDetail';

export default function GroupsPanel({ currentUserId }) {
  const [groups, setGroups] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  async function fetchGroups() {
    const token = getAuthToken();
    try {
      const data = await listGroups(token);
      setGroups(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { fetchGroups(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    const token = getAuthToken();
    try {
      await createGroup(newName, token);
      setNewName('');
      fetchGroups();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const token = getAuthToken();
    try {
      await deleteGroup(id, token);
      if (selectedId === id) setSelectedId(null);
      fetchGroups();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="groups-panel">
      <h2>Accountability Groups</h2>
      {error && <p style={{ color: 'var(--color-danger, #e53e3e)' }}>{error}</p>}

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="New group name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit">Create Group</button>
      </form>

      {groups.length === 0 && <p style={{ color: 'var(--color-text-muted, #718096)' }}>You are not in any groups yet.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {groups.map((g) => (
          <li key={g._id} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button type="button" onClick={() => setSelectedId(selectedId === g._id ? null : g._id)} style={{ fontWeight: selectedId === g._id ? 'bold' : 'normal' }}>
              {g.name} ({g.memberCount} member{g.memberCount !== 1 ? 's' : ''})
            </button>
            {g.ownerId?.toString() === currentUserId && (
              <button type="button" onClick={() => handleDelete(g._id)} style={{ fontSize: '0.75rem', color: 'var(--color-danger, #e53e3e)' }}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {selectedId && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px' }}>
          <GroupDetail
            groupId={selectedId}
            currentUserId={currentUserId}
            onLeave={() => { setSelectedId(null); fetchGroups(); }}
          />
        </div>
      )}
    </div>
  );
}
