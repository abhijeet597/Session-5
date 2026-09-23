import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddHabitForm from '../AddHabitForm.jsx';
import AddCategoryForm from '../AddCategoryForm.jsx';

// ───────────────────────────────── AddHabitForm ──────────────────────────────

describe('AddHabitForm', () => {
  const sampleCategories = [
    { name: 'Health' },
    { name: 'Learning' },
    { name: 'Fitness' },
  ];

  it('renders category options from props', () => {
    render(<AddHabitForm categories={sampleCategories} onSubmit={vi.fn()} />);

    // All three category names should appear as <option> elements
    expect(screen.getByRole('option', { name: 'Health' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Learning' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Fitness' })).toBeInTheDocument();
  });

  it('calls onSubmit with correct values for a Daily habit', () => {
    const handleSubmit = vi.fn();
    render(<AddHabitForm categories={sampleCategories} onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText('Habit Name'), {
      target: { value: 'Morning run' },
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Health' },
    });
    // Frequency already defaults to Daily

    fireEvent.submit(screen.getByRole('button', { name: 'Add Habit' }).closest('form'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(handleSubmit).toHaveBeenCalledWith('Morning run', 'Health', 'Daily', undefined);
  });

  it('calls onSubmit with dayOfMonth when Monthly is selected', () => {
    const handleSubmit = vi.fn();
    render(<AddHabitForm categories={sampleCategories} onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText('Habit Name'), {
      target: { value: 'Pay bills' },
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Learning' },
    });
    fireEvent.change(screen.getByLabelText('Frequency'), {
      target: { value: 'Monthly' },
    });
    fireEvent.change(screen.getByLabelText('Day of Month'), {
      target: { value: '15' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Add Habit' }).closest('form'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(handleSubmit).toHaveBeenCalledWith('Pay bills', 'Learning', 'Monthly', 15);
  });

  it('shows day-of-month field only when Monthly is selected', () => {
    render(<AddHabitForm categories={sampleCategories} onSubmit={vi.fn()} />);

    // Default is Daily — day-of-month field should not be present
    expect(screen.queryByLabelText('Day of Month')).not.toBeInTheDocument();

    // Switch to Weekly — still hidden
    fireEvent.change(screen.getByLabelText('Frequency'), {
      target: { value: 'Weekly' },
    });
    expect(screen.queryByLabelText('Day of Month')).not.toBeInTheDocument();

    // Switch to Monthly — now visible
    fireEvent.change(screen.getByLabelText('Frequency'), {
      target: { value: 'Monthly' },
    });
    expect(screen.getByLabelText('Day of Month')).toBeInTheDocument();

    // Switch back to Daily — hidden again
    fireEvent.change(screen.getByLabelText('Frequency'), {
      target: { value: 'Daily' },
    });
    expect(screen.queryByLabelText('Day of Month')).not.toBeInTheDocument();
  });

  it('resets all fields after submit', () => {
    render(<AddHabitForm categories={sampleCategories} onSubmit={vi.fn()} />);

    const nameInput = screen.getByLabelText('Habit Name');
    const frequencySelect = screen.getByLabelText('Frequency');

    fireEvent.change(nameInput, { target: { value: 'Yoga' } });
    fireEvent.change(frequencySelect, { target: { value: 'Monthly' } });
    fireEvent.change(screen.getByLabelText('Day of Month'), {
      target: { value: '5' },
    });

    fireEvent.submit(nameInput.closest('form'));

    expect(nameInput.value).toBe('');
    expect(frequencySelect.value).toBe('Daily');
    // Day of Month field should be gone after reset to Daily
    expect(screen.queryByLabelText('Day of Month')).not.toBeInTheDocument();
  });
});

// ─────────────────────────────── AddCategoryForm ─────────────────────────────

describe('AddCategoryForm', () => {
  it('calls onSubmit with the entered name', () => {
    const handleSubmit = vi.fn();
    render(<AddCategoryForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText('Category Name'), {
      target: { value: 'Mindfulness' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Add' }).closest('form'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(handleSubmit).toHaveBeenCalledWith('Mindfulness');
  });

  it('resets the input after submit', () => {
    render(<AddCategoryForm onSubmit={vi.fn()} />);

    const input = screen.getByLabelText('Category Name');
    fireEvent.change(input, { target: { value: 'Work' } });
    fireEvent.submit(input.closest('form'));

    expect(input.value).toBe('');
  });
});
