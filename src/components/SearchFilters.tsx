import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, Star } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  categories: Array<{ id: string; name: string }>;
}

interface SearchFilters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  inStock: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, categories }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    inStock: false,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      inStock: false,
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Basic Search */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, barcodes, or tags..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name.toLowerCase()}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price (฿)
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price (฿)
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="999999"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="stock">Stock</option>
                  <option value="createdAt">Date Added</option>
                </select>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">In Stock Only</span>
            </label>

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;