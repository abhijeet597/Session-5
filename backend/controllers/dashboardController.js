const Habit = require('../models/Habit');
const { toISO, allCompletedDates, currentStreak, longestStreak } = require('../utils/streakUtils');

function startOfWeek(date) {
  const start = new Date(date);
  const day = start.getUTCDay();
  const diff = (day + 6) % 7; // Days since Monday.
  start.setUTCDate(start.getUTCDate() - diff);
  return start;
}

function thisWeekCompletionRate(habits) {
  if (habits.length === 0) return 0;

  const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  const weekStart = startOfWeek(today);
  const daysSoFar = Math.round((today - weekStart) / 86400000) + 1;

  let possible = 0;
  let completed = 0;

  habits.forEach((habit) => {
    for (let i = 0; i < daysSoFar; i += 1) {
      const day = new Date(weekStart);
      day.setUTCDate(day.getUTCDate() + i);
      const dayStr = toISO(day);
      possible += 1;
      if (habit.completedDates.includes(dayStr)) {
        completed += 1;
      }
    }
  });

  return possible === 0 ? 0 : completed / possible;
}

function completionsByCategory(habits) {
  const breakdown = {};
  habits.forEach((habit) => {
    breakdown[habit.category] = (breakdown[habit.category] || 0) + habit.completedDates.length;
  });
  return breakdown;
}

async function getDashboard(req, res) {
  const habits = await Habit.find({ userId: req.userId });
  const completedDateSet = allCompletedDates(habits);

  res.json({
    currentStreak: currentStreak(completedDateSet),
    longestStreak: longestStreak(completedDateSet),
    thisWeekCompletionRate: thisWeekCompletionRate(habits),
    completionsByCategory: completionsByCategory(habits),
  });
}

module.exports = { getDashboard, calculateStreak: currentStreak, longestStreak, weeklyCompletionRate: thisWeekCompletionRate };
