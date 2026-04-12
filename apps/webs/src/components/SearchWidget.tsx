import React, { useState } from 'react';

interface SearchWidgetProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({
  onSearch,
  placeholder = 'Search by polling station ID, upload ID...',
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounced search
    if (value.length > 0) {
      // Could implement debouncing here
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-8">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          🔍 Search
        </button>
      </form>

      {/* Filter Options */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-gray-600 text-sm font-medium">Quick filters:</span>
        <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition">
          Verified
        </button>
        <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition">
          Pending
        </button>
        <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition">
          Processing
        </button>
        <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition">
          Today
        </button>
      </div>
    </div>
  );
};
