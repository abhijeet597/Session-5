// filter.js — pure filtering logic, kept separate from the DOM so it can be tested directly

export function filterHabits(habits, category, dateFrom, dateTo) {
  return habits.filter((habit) => {
    const matchesCategory = !category || habit.category === category;
    let afterFrom = true;
    let beforeTo = true;
    try {
      const createdAt =
        habit.createdDate instanceof Date
          ? habit.createdDate
          : new Date(`${habit.createdDate}T00:00:00Z`);
      afterFrom = !dateFrom || createdAt.getTime() >= dateFrom.getTime();
      beforeTo = !dateTo || createdAt.getTime() <= dateTo.getTime();
    } catch (e) {
      afterFrom = false;
      beforeTo = false;
    }
    return matchesCategory && afterFrom && beforeTo;
  });
}


export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function getNextDueDate(lastCompletedDate, rule) {
  const last = new Date(`${lastCompletedDate}T00:00:00Z`);

  if (rule.interval === 'weekly') {
    last.setUTCDate(last.getUTCDate() + 7);
    return last.toISOString().slice(0, 10);
  }

  if (rule.interval === 'monthly') {
    last.setUTCMonth(last.getUTCMonth() + 1);
    return last.toISOString().slice(0, 10);
  }

  throw new Error(`Unknown recurrence interval: ${rule.interval}`);
}

export function sortHabits(list, field, dir) {
  const sorted = [...list].sort((a, b) => {
    let valA;
    let valB;

    if (field === 'checkins') {
      valA = a.completedDates.length;
      valB = b.completedDates.length;
    } else {
      valA = a[field];
      valB = b[field];
    }

    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });

  if (dir === 'desc') sorted.reverse();

  return sorted;
}
