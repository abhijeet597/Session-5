import { useState } from 'react';

/**
 * AddHabitForm — controlled form for adding a new habit.
 *
 * Props:
 *   categories  {Array<{name: string}>}  list of available categories
 *   onSubmit    {Function(name, category, frequency, dayOfMonth)}
 */
export default function AddHabitForm({ categories = [], onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [dayOfMonth, setDayOfMonth] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    const dom = frequency === 'Monthly' ? Number(dayOfMonth) : undefined;

    onSubmit(name, category, frequency, dom);

    // Reset
    setName('');
    setCategory('');
    setFrequency('Daily');
    setDayOfMonth('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="habit-name">Habit Name</label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning run, Read 20 mins…"
          required
        />
      </div>

      <div>
        <label htmlFor="habit-category">Category</label>
        <select
          id="habit-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="habit-frequency">Frequency</label>
        <select
          id="habit-frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          required
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      {frequency === 'Monthly' && (
        <div>
          <label htmlFor="habit-day-of-month">Day of Month</label>
          <input
            id="habit-day-of-month"
            type="number"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            placeholder="1 – 31"
            min="1"
            max="31"
          />
        </div>
      )}

      <button type="submit">Add Habit</button>
    </form>
  );
}
