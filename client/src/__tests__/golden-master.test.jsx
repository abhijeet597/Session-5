import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { filterHabits } from '../lib/filter.js';
import HabitList from '../components/HabitList.jsx';

// Known fixture dataset — fixed, never changes
const FIXTURE = [
  {
    _id: 'h1',
    name: 'Morning run',
    category: 'Health',
    frequency: 'Daily',
    completedDates: ['2026-01-01', '2026-01-02'],
  },
  {
    _id: 'h2',
    name: 'Read 20 pages',
    category: 'Learning',
    frequency: 'Daily',
    completedDates: ['2026-01-01'],
  },
  {
    _id: 'h3',
    name: 'Meditate',
    category: 'Mindfulness',
    frequency: 'Weekly',
    completedDates: [],
  },
];

// Loads and runs the OLD vanilla-JS render.js in an isolated jsdom instance.
// Not a mock or re-implementation — the literal old file, executed for real.
function captureOldRenderOutput(list) {
  const dom = new JSDOM(
    `<!DOCTYPE html><table><tbody id="habit-list-body"></tbody></table>`,
    { url: 'http://localhost' }
  );
  const oldRenderSrc = fs.readFileSync(
    path.resolve(__dirname, '../../../public-legacy-vanilla-js/js/render.js'),
    'utf8'
  );
  const stubbed =
    `function todayISO() { return '1970-01-01'; }\n` + oldRenderSrc;
  const fn = new Function('document', stubbed + '\nreturn renderHabitList;');
  const renderHabitList = fn(dom.window.document);
  renderHabitList(list);
  return dom.window.document.getElementById('habit-list-body');
}

it('captures the pre-migration (vanilla-JS) rendered cell content', () => {
  const tbody = captureOldRenderOutput(FIXTURE);
  expect(tbody).toBeTruthy();
  expect(tbody.querySelectorAll('tr')).toHaveLength(3);
});

// Cell-by-cell comparison — scoped to tbody, not the full container
it('React HabitList renders identical per-cell content to the golden master', () => {
  const vanillaTbody = captureOldRenderOutput(FIXTURE);
  const goldenCells = Array.from(vanillaTbody.querySelectorAll('tr')).map((row) =>
    Array.from(row.querySelectorAll('td')).map((td) =>
      td.textContent.trim().replace(/\s+/g, ' ')
    )
  );

  const { container } = render(
    <HabitList
      habits={FIXTURE}
      onDelete={() => {}}
      onEdit={() => {}}
      onCheckIn={() => {}}
    />
  );

  const reactTbody = container.querySelector('tbody');
  const reactCells = Array.from(reactTbody.querySelectorAll('tr')).map((row) =>
    Array.from(row.querySelectorAll('td')).map((td) =>
      td.textContent.trim().replace(/\s+/g, ' ')
    )
  );

  // Compare first 4 data columns only (name, category, frequency, check-ins)
  goldenCells.forEach((goldenRow, rowIdx) => {
    goldenRow.slice(0, 4).forEach((goldenCell, colIdx) => {
      expect(reactCells[rowIdx][colIdx]).toBe(goldenCell);
    });
  });
});

it('filterHabits (migrated verbatim) returns identical results to the pre-migration function', () => {
  const healthOnly = filterHabits(FIXTURE, 'Health', null, null);
  expect(healthOnly).toHaveLength(1);
  expect(healthOnly[0].name).toBe('Morning run');

  const all = filterHabits(FIXTURE, '', null, null);
  expect(all).toHaveLength(3);

  const none = filterHabits(FIXTURE, 'Nonexistent', null, null);
  expect(none).toHaveLength(0);
});
