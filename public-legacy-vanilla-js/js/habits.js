// habits.js — getHabits and addHabit now talk to the backend API.
// deleteHabit below is intentionally unchanged from the in-memory version.
// It still mutates a local array instead of deleting from the backend.
// This is the bug students are expected to find in this session.

const API_BASE = '/api/habits';
const CATEGORIES_API_BASE = '/api/categories';
const TOKEN_KEY = 'habitTracker.token';

// Stale local cache — leftover from the pre-backend version.
// getHabits() populates it, but deleteHabit() incorrectly operates on it.
let localHabitsCache = [];

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    // Ignore storage failures.
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    // Ignore storage failures.
  }
}

function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function signup(email, password) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

// Categories fix: fetches the real category list from the backend instead of a hardcoded one.
async function getCategories() {
  const res = await fetch(CATEGORIES_API_BASE, {
    headers: authHeaders(),
  });
  const data = await res.json();

  return data;
}

// Categories fix: lets a user actually create a category, so the dropdown has something to show.
async function addCategory(name) {
  const res = await fetch(CATEGORIES_API_BASE, {
    method: 'POST',
    headers: authHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ name }),
  });

  return res.json();
}

async function getHabits() {
  const res = await fetch(API_BASE, {
    headers: authHeaders(),
  });
  const data = await res.json();

  localHabitsCache = data;
  return data;
}

async function addHabit(name, category, frequency, dayOfMonth) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: authHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      name,
      category,
      frequency,
      dayOfMonth,
    }),
  });

  return res.json();
}

// Intentionally unchanged from the previous in-memory implementation.
// BUG: This only removes the habit from the local cache.
// It does NOT send a DELETE request to the backend.
// function deleteHabit(id) {
//   const index = localHabitsCache.findIndex(
//     (habit) => habit._id === id
//   );

//   if (index === -1) return false;

//   localHabitsCache.splice(index, 1);
//   return true;
// }

async function deleteHabit(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete habit');
  }

  return true;
}

async function updateHabit(id, frequency) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ frequency }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update habit');
  }
  
  //const d = await res.json();

  //console.log(d.frequency);
  

  return res.json();
}

async function checkInHabit(id) {
  const today = todayISO();
  const habit = localHabitsCache.find((h) => h._id === id);
  const completedDates = habit ? [...habit.completedDates, today] : [today];

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ completedDates }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to check in habit');
  }

  return res.json();
}