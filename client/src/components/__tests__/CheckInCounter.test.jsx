import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CheckInCounter from '../CheckInCounter';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('advances past 1/3 and confirms after being held for 3 ticks', () => {
  const onConfirm = vi.fn();
  render(<CheckInCounter onConfirm={onConfirm} />);
  const button = screen.getByRole('button');

  fireEvent.mouseDown(button);
  act(() => { vi.advanceTimersByTime(2000); }); // well past the 3 x 500ms needed
  expect(button.textContent).not.toBe('Hold... 1/3');
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

it('resets to "Hold to check in" if released before 3 ticks', () => {
  const onConfirm = vi.fn();
  render(<CheckInCounter onConfirm={onConfirm} />);
  const button = screen.getByRole('button');

  fireEvent.mouseDown(button);
  act(() => { vi.advanceTimersByTime(400); }); // less than one tick
  fireEvent.mouseUp(button);
  expect(button.textContent).toBe('Hold to check in');
  expect(onConfirm).not.toHaveBeenCalled();
});
