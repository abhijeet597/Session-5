import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterBar from '../FilterBar';

const defaultProps = {
  categories: [
    { name: 'Health' },
    { name: 'Learning' },
    { name: 'Fitness' },
  ],
  filterCategory: '',
  filterDateFrom: '',
  filterDateTo: '',
  sortField: 'name',
  sortDir: 'asc',
  onFilterChange: vi.fn(),
  onSortChange: vi.fn(),
  onClearFilters: vi.fn(),
};

describe('FilterBar', () => {
  it('renders with category list populated from props', () => {
    render(<FilterBar {...defaultProps} />);

    // "All Categories" default option is present
    expect(screen.getByText('All Categories')).toBeInTheDocument();

    // Each category from props is rendered as an option
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Learning')).toBeInTheDocument();
    expect(screen.getByText('Fitness')).toBeInTheDocument();
  });

  it('calls onFilterChange with correct args when category select changes', () => {
    const onFilterChange = vi.fn();
    render(<FilterBar {...defaultProps} onFilterChange={onFilterChange} />);

    const select = document.getElementById('filter-category');
    fireEvent.change(select, { target: { value: 'Health' } });

    expect(onFilterChange).toHaveBeenCalledWith('category', 'Health');
  });

  it('calls onClearFilters when Clear button is clicked', () => {
    const onClearFilters = vi.fn();
    render(<FilterBar {...defaultProps} onClearFilters={onClearFilters} />);

    const clearBtn = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearBtn);

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it('calls onSortChange when sort field changes', () => {
    const onSortChange = vi.fn();
    render(<FilterBar {...defaultProps} onSortChange={onSortChange} />);

    const sortFieldSelect = document.getElementById('sort-field');
    fireEvent.change(sortFieldSelect, { target: { value: 'category' } });

    expect(onSortChange).toHaveBeenCalledWith('field', 'category');
  });
});
