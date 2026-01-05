import { useState } from 'react'
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  Package,
  ChevronDown,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

const BulkActions = ({ 
  items = [], 
  selectedItems = [], 
  onSelectionChange, 
  onBulkAction,
  actions = [],
  loading = false,
  className = ""
}) => {
  const [showActions, setShowActions] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const isAllSelected = items.length > 0 && selectedItems.length === items.length
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < items.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map(item => item.id))
    }
  }

  const handleItemSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId))
    } else {
      onSelectionChange([...selectedItems, itemId])
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first')
      return
    }

    if (action.confirm) {
      const confirmed = window.confirm(
        `Are you sure you want to ${action.label.toLowerCase()} ${selectedItems.length} item(s)?`
      )
      if (!confirmed) return
    }

    setActionLoading(true)
    try {
      await onBulkAction(action.key, selectedItems)
      onSelectionChange([]) // Clear selection after action
      setShowActions(false)
    } catch (error) {
      console.error('Bulk action error:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const defaultActions = [
    {
      key: 'activate',
      label: 'Activate',
      icon: Eye,
      color: 'text-green-600',
      confirm: false
    },
    {
      key: 'deactivate',
      label: 'Deactivate',
      icon: EyeOff,
      color: 'text-yellow-600',
      confirm: false
    },
    {
      key: 'feature',
      label: 'Feature',
      icon: Star,
      color: 'text-blue-600',
      confirm: false
    },
    {
      key: 'unfeature',
      label: 'Unfeature',
      icon: StarOff,
      color: 'text-gray-600',
      confirm: false
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      color: 'text-red-600',
      confirm: true
    }
  ]

  const availableActions = actions.length > 0 ? actions : defaultActions

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Select All Checkbox */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleSelectAll}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          disabled={loading}
        >
          {isAllSelected ? (
            <CheckSquare className="h-5 w-5 text-primary-600" />
          ) : isPartiallySelected ? (
            <div className="h-5 w-5 border-2 border-primary-600 rounded bg-primary-600 flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-sm" />
            </div>
          ) : (
            <Square className="h-5 w-5" />
          )}
          <span>
            {selectedItems.length > 0 
              ? `${selectedItems.length} selected`
              : 'Select all'
            }
          </span>
        </button>
      </div>

      {/* Bulk Actions Dropdown */}
      {selectedItems.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowActions(!showActions)}
            className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Package className="h-4 w-4" />
            )}
            <span>Bulk Actions</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showActions && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                {availableActions.map((action) => {
                  const IconComponent = action.icon
                  return (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => handleBulkAction(action)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${action.color}`}
                      disabled={actionLoading}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Individual Item Checkboxes (for use in lists) */}
      <div className="hidden">
        {items.map((item) => (
          <input
            key={item.id}
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={() => handleItemSelect(item.id)}
            className="bulk-checkbox"
            data-item-id={item.id}
          />
        ))}
      </div>
    </div>
  )
}

// Individual item checkbox component
export const BulkCheckbox = ({ itemId, selectedItems, onSelectionChange, className = "" }) => {
  const isSelected = selectedItems.includes(itemId)

  const handleChange = () => {
    if (isSelected) {
      onSelectionChange(selectedItems.filter(id => id !== itemId))
    } else {
      onSelectionChange([...selectedItems, itemId])
    }
  }

  return (
    <button
      type="button"
      onClick={handleChange}
      className={`flex items-center justify-center ${className}`}
    >
      {isSelected ? (
        <CheckSquare className="h-5 w-5 text-primary-600" />
      ) : (
        <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
      )}
    </button>
  )
}

export default BulkActions