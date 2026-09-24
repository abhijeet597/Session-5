function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function allCompletedDates(habits) {
  const dates = new Set();
  habits.forEach((habit) => {
    habit.completedDates.forEach((date) => dates.add(date));
  });
  return dates;
}

function currentStreak(completedDateSet) {
  let streak = 0;
  const cursor = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);

  if (!completedDateSet.has(toISO(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (completedDateSet.has(toISO(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

function longestStreak(completedDateSet) {
  const sortedDates = [...completedDateSet].sort();
  let longest = 0;
  let current = 0;
  let prev = null;

  sortedDates.forEach((dateStr) => {
    const date = new Date(`${dateStr}T00:00:00Z`);
    if (prev) {
      const dayDiff = Math.round((date - prev) / 86400000);
      current = dayDiff === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    prev = date;
  });

  return longest;
}

function isAtRisk(completedDates) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dateSet = new Set(completedDates);
  const streak = currentStreak(dateSet);
  return streak > 0 && !dateSet.has(todayStr);
}

module.exports = { toISO, allCompletedDates, currentStreak, longestStreak, isAtRisk };
