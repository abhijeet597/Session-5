const mongoose = require('mongoose');
const Habit = require('./models/Habit');

const today = new Date().toISOString().split('T')[0];

async function sendReminder(habit_name, streak) {
  const res = await fetch('http://localhost:4000/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'send_reminder', input: { habit_name, streak } })
  });
  return res.json();
}

function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  let streak = 0;
  let check = new Date();
  check.setDate(check.getDate() - 1); // start from yesterday
  for (const date of sorted) {
    const d = check.toISOString().split('T')[0];
    if (date === d) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker');

  const habits = await Habit.find({ frequency: 'Daily' });
  const atRisk = [];

  for (const habit of habits) {
    const checkedToday = habit.completedDates.includes(today);
    const streak = calculateStreak(habit.completedDates);
    if (!checkedToday && streak > 0) {
      atRisk.push({ name: habit.name, streak });
    }
  }

  console.log(`\n[habit-reminders MCP]`);
  console.log(`Checked ${habits.length} habits with today's check-in still pending.\n`);

  for (const h of atRisk) {
    await sendReminder(h.name, h.streak);
  }

  if (atRisk.length === 0) {
    console.log('No habits at risk today.');
  } else {
    console.log(`\nSent ${atRisk.length} reminder(s): ${atRisk.map(h => `"${h.name}" — ${h.streak}-day streak at risk`).join(', ')}`);
  }

  await mongoose.disconnect();
})();
