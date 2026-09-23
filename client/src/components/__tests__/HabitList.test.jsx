import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HabitList from '../HabitList';

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

const fixtures = [
  {
    _id: 'abc123',
    name: 'Morning Run',
    category: 'Fitness',
    frequency: 'Daily',
    completedDates: [yesterday],
  },
  {
    _id: 'def456',
    name: 'Read 20 mins',
    category: 'Learning',
    frequency: 'Daily',
    completedDates: [today],
  },
  {
    _id: 'ghi789',
    name: 'Meditate',
    category: 'Wellness',
    frequency: 'Weekly',
    completedDates: [],
  },
];

describe('HabitList', () => {
  it('renders the correct number of rows for the fixture', () => {
    render(
      <HabitList
        habits={fixtures}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onCheckIn={vi.fn()}
      />
    );
    // Each habit renders one row; check that all three habit names appear
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
    expect(screen.getByText('Read 20 mins')).toBeInTheDocument();
    expect(screen.getByText('Meditate')).toBeInTheDocument();
  });

  it('calls onDelete with the habit _id when Delete is clicked', () => {
    const onDelete = vi.fn();
    render(
      <HabitList
        habits={fixtures}
        onDelete={onDelete}
        onEdit={vi.fn()}
        onCheckIn={vi.fn()}
      />
    );
    // Click the Delete button in the first row (Morning Run)
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith('abc123');
  });

  it('calls onCheckIn with the habit _id when check-in button is clicked', () => {
    const onCheckIn = vi.fn();
    render(
      <HabitList
        habits={fixtures}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onCheckIn={onCheckIn}
      />
    );
    // Meditate (ghi789) has no completedDates — its check-in button is enabled
    const checkInButtons = screen.getAllByRole('button', { name: 'Check in today' });
    fireEvent.click(checkInButtons[0]);
    expect(onCheckIn).toHaveBeenCalledOnce();
    // The first enabled check-in button belongs to Morning Run (abc123) since yesterday != today
    expect(onCheckIn).toHaveBeenCalledWith('abc123');
  });

  it('check-in button is disabled for a habit already checked in today', () => {
    render(
      <HabitList
        habits={fixtures}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onCheckIn={vi.fn()}
      />
    );
    // "Read 20 mins" has today in completedDates, so its button should say "Checked in ✓" and be disabled
    const checkedInButton = screen.getByRole('button', { name: 'Checked in ✓' });
    expect(checkedInButton).toBeDisabled();
  });

  it('shows empty state row when habits list is empty', () => {
    render(
      <HabitList
        habits={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onCheckIn={vi.fn()}
      />
    );
    expect(
      screen.getByText('No habits match these filters.')
    ).toBeInTheDocument();
  });
});
