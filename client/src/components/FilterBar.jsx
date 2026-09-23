// FilterBar.jsx — fully controlled presentational component for filter and sort controls.

export default function FilterBar({
  categories,
  filterCategory,
  filterDateFrom,
  filterDateTo,
  sortField,
  sortDir,
  onFilterChange,
  onSortChange,
  onClearFilters,
}) {
  return (
    <div className="toolbar-bar">
      {/* Sort controls */}
      <div className="toolbar-chip-group" id="sort-controls">
        <span className="toolbar-chip-label">Sort by</span>
        <select
          id="sort-field"
          className="toolbar-select"
          value={sortField}
          onChange={(e) => onSortChange('field', e.target.value)}
        >
          <option value="name">Name</option>
          <option value="category">Category</option>
          <option value="frequency">Frequency</option>
          <option value="checkins">Check-ins</option>
        </select>
        <select
          id="sort-dir"
          className="toolbar-select toolbar-select--dir"
          value={sortDir}
          onChange={(e) => onSortChange('dir', e.target.value)}
        >
          <option value="asc">↑ Asc</option>
          <option value="desc">↓ Desc</option>
        </select>
      </div>

      <div className="toolbar-sep"></div>

      {/* Filter controls */}
      <div className="toolbar-chip-group" id="filter-controls">
        <span className="toolbar-chip-label">Filter</span>
        <select
          id="filter-category"
          className="toolbar-select"
          value={filterCategory}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="date-range">
          <input
            type="date"
            id="filter-date-from"
            className="toolbar-date"
            title="From date"
            value={filterDateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
          />
          <span className="date-range-arrow">→</span>
          <input
            type="date"
            id="filter-date-to"
            className="toolbar-date"
            title="To date"
            value={filterDateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        id="clear-filters"
        className="toolbar-clear-btn"
        onClick={onClearFilters}
      >
        ✕ Clear
      </button>
    </div>
  );
}
