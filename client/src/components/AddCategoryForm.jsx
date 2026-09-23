import { useState } from 'react';

/**
 * AddCategoryForm — controlled form for adding a new category.
 *
 * Props:
 *   onSubmit  {Function(name: string)}
 */
export default function AddCategoryForm({ onSubmit }) {
  const [name, setName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit(name);

    // Reset
    setName('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="category-name">Category Name</label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
        />
      </div>

      <button type="submit">Add</button>
    </form>
  );
}
