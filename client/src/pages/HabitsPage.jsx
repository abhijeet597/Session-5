import { useAuth } from '../context/AuthContext';

export default function HabitsPage() {
  const { logout } = useAuth();

  return (
    <div id="app-container">
      <header>
        <h1>Habit Tracker</h1>
        <button type="button" onClick={logout}>Log out</button>
      </header>
      <main>
        <p>Your habits will appear here.</p>
      </main>
    </div>
  );
}
