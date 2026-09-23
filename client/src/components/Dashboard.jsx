/**
 * Dashboard — presentational analytics component.
 *
 * Props:
 *   data {object|null} — the response from GET /api/dashboard:
 *     currentStreak        {number}
 *     longestStreak        {number}
 *     thisWeekCompletionRate {number}  0–1 fraction
 *     completionsByCategory  {object}  { [categoryName]: checkInCount }
 */
function Dashboard({ data }) {
  if (!data) {
    return (
      <div className="dashboard dashboard--loading" aria-busy="true">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  const {
    currentStreak,
    longestStreak,
    thisWeekCompletionRate,
    completionsByCategory,
  } = data;

  const completionPercent = Math.round((thisWeekCompletionRate ?? 0) * 100);
  const categoryEntries = completionsByCategory
    ? Object.entries(completionsByCategory)
    : [];

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Your Analytics</h2>

      <section className="dashboard__metrics" aria-label="Key metrics">
        <div className="dashboard__metric">
          <span className="dashboard__metric-label">Current Streak</span>
          <span className="dashboard__metric-value" data-testid="current-streak">
            {currentStreak ?? 0} day{currentStreak !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="dashboard__metric">
          <span className="dashboard__metric-label">Longest Streak</span>
          <span className="dashboard__metric-value" data-testid="longest-streak">
            {longestStreak ?? 0} day{longestStreak !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="dashboard__metric">
          <span className="dashboard__metric-label">This Week</span>
          <span className="dashboard__metric-value" data-testid="weekly-completion-rate">
            {completionPercent}%
          </span>
        </div>
      </section>

      {categoryEntries.length > 0 && (
        <section className="dashboard__categories" aria-label="Category breakdown">
          <h3 className="dashboard__section-title">Check-ins by Category</h3>
          <ul className="dashboard__category-list" data-testid="category-list">
            {categoryEntries.map(([category, count]) => (
              <li key={category} className="dashboard__category-item">
                <span className="dashboard__category-name">{category}</span>
                <span className="dashboard__category-count" data-testid={`category-count-${category}`}>
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
