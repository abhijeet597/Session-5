import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';

const fixtureData = {
  currentStreak: 5,
  longestStreak: 14,
  thisWeekCompletionRate: 0.75,
  completionsByCategory: {
    Health: 20,
    Fitness: 8,
    Learning: 3,
  },
};

describe('Dashboard', () => {
  describe('loading state', () => {
    it('shows a loading message when data is null', () => {
      render(<Dashboard data={null} />);
      expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
    });

    it('shows a loading message when data is undefined', () => {
      render(<Dashboard />);
      expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
    });
  });

  describe('with fixture data', () => {
    beforeEach(() => {
      render(<Dashboard data={fixtureData} />);
    });

    it('renders the current streak', () => {
      const el = screen.getByTestId('current-streak');
      expect(el).toHaveTextContent('5 days');
    });

    it('renders the longest streak', () => {
      const el = screen.getByTestId('longest-streak');
      expect(el).toHaveTextContent('14 days');
    });

    it('renders the weekly completion rate as a percentage', () => {
      const el = screen.getByTestId('weekly-completion-rate');
      expect(el).toHaveTextContent('75%');
    });

    it('renders the category breakdown list', () => {
      const list = screen.getByTestId('category-list');
      expect(list).toBeInTheDocument();

      // All three categories are present
      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.getByText('Fitness')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
    });

    it('renders the correct count for each category', () => {
      expect(screen.getByTestId('category-count-Health')).toHaveTextContent('20');
      expect(screen.getByTestId('category-count-Fitness')).toHaveTextContent('8');
      expect(screen.getByTestId('category-count-Learning')).toHaveTextContent('3');
    });
  });

  describe('singular streak label', () => {
    it('uses singular "day" when streak is 1', () => {
      render(
        <Dashboard
          data={{ ...fixtureData, currentStreak: 1, longestStreak: 1 }}
        />
      );
      const streaks = screen.getAllByText('1 day');
      expect(streaks).toHaveLength(2);
    });
  });

  describe('empty category breakdown', () => {
    it('does not render the category section when completionsByCategory is empty', () => {
      render(
        <Dashboard data={{ ...fixtureData, completionsByCategory: {} }} />
      );
      expect(screen.queryByTestId('category-list')).not.toBeInTheDocument();
    });
  });
});
