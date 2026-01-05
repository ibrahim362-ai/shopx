import { useState, useEffect } from 'react'
import { 
  Filter, 
  X, 
  Search, 
  Calendar,
  DollarSign,
  Package,
  Tag,
  ChevronDown,
  RotateCcw
} from 'lucide-react'

const AdvancedFilters = ({ 
  filters = {}, 
  onFiltersChange, 
  categories = [],
  className = "",
  type = "products" // products, categories, messages
}) => {
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {}
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = Object.keys(localFilters).some(key => 
    localFilters[key] !== undefined && localFilters[key] !== '' && localFilters[key] !== null
  )

  const getFilterCount = () => {
    return Object.keys(localFilters).filter(key => 
      localFilters[key] !== undefined && localFilters[key] !== '' && localFilters[key] !== null
    ).length
  }

  const renderProductFilters = () => (
    <>
      {/* Search */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Search className="inline h-4 w-4 mr-1" />
          Search
        </label>
        <input
          type="text"
          value={localFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search products..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Package className="inline h-4 w-4 mr-1" />
          Status
        </label>
        <select
          value={localFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Tag className="inline h-4 w-4 mr-1" />
          Category
        </label>
        <select
          value={localFilters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.parent ? `${category.parent.name} > ` : ''}{category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <DollarSign className="inline h-4 w-4 mr-1" />
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={localFilters.minPrice || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="Min"
            min="0"
            step="0.01"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="number"
            value={localFilters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Max"
            min="0"
            step="0.01"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Featured Toggle */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={localFilters.featured === 'true'}
            onChange={(e) => handleFilterChange('featured', e.target.checked ? 'true' : '')}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Featured Only</span>
        </label>
      </div>

      {/* Low Stock Toggle */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={localFilters.lowStock === 'true'}
            onChange={(e) => handleFilterChange('lowStock', e.target.checked ? 'true' : '')}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Low Stock Only</span>
        </label>
      </div>
    </>
  )

  const renderCategoryFilters = () => (
    <>
      {/* Search */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Search className="inline h-4 w-4 mr-1" />
          Search
        </label>
        <input
          type="text"
          value={localFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search categories..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Package className="inline h-4 w-4 mr-1" />
          Status
        </label>
        <select
          value={localFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Parent Category */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Tag className="inline h-4 w-4 mr-1" />
          Parent Category
        </label>
        <select
          value={localFilters.parentId || ''}
          onChange={(e) => handleFilterChange('parentId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Levels</option>
          <option value="null">Root Categories</option>
          {categories.filter(cat => !cat.parentId).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </>
  )

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
        >
          <Filter className="h-5 w-5" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
              {getFilterCount()}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Filter Content */}
      {showFilters && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {type === 'products' && renderProductFilters()}
            {type === 'categories' && renderCategoryFilters()}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedFilters