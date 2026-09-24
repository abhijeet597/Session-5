import { useState, useEffect } from 'react';
import { listNotifications, markRead, markAllRead } from '../lib/notifications';

export default function NotificationBell({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  async function fetchNotifications() {
    try {
      const data = await listNotifications(token);
      setNotifications(data);
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  async function handleMarkRead(id) {
    try {
      await markRead(id, token);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      // ignore
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead(token);
      setNotifications([]);
    } catch {
      // ignore
    }
  }

  return (
    <div className="notification-bell" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', position: 'relative' }}
        aria-label={`Notifications${notifications.length > 0 ? `, ${notifications.length} unread` : ''}`}
      >
        🔔
        {notifications.length > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-6px',
            background: 'var(--color-danger, #e53e3e)', color: '#fff',
            borderRadius: '50%', fontSize: '0.65rem', width: '16px', height: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '110%', width: '300px',
          background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100,
        }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Notifications</strong>
            {notifications.length > 0 && (
              <button type="button" onClick={handleMarkAllRead} style={{ fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary, #667eea)' }}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p style={{ padding: '1rem', color: 'var(--color-text-muted, #718096)', fontSize: '0.875rem' }}>No new notifications</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '240px', overflowY: 'auto' }}>
              {notifications.map((n) => (
                <li key={n._id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.875rem' }}>
                  <span>{n.payload?.atRiskEmail} is at risk in <strong>{n.payload?.groupName}</strong></span>
                  <button type="button" onClick={() => handleMarkRead(n._id)} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted, #718096)', fontSize: '0.75rem' }}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
