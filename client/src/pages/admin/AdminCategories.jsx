import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, FolderTree } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import CategoryForm from '../../components/admin/CategoryForm'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories/admin/all')
      // Handle both array and object responses
      const categoriesData = response.data.categories || response.data
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      if (error.response?.status === 401) {
        toast.error('Please log in to access admin features')
        // Redirect to login if not authenticated
        window.location.href = '/admin/login'
      } else {
        toast.error('Failed to load categories')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await axios.delete(`/api/categories/${categoryId}`)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete category'
      toast.error(message)
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, formData)
        toast.success('Category updated successfully')
      } else {
        await axios.post('/api/categories', formData)
        toast.success('Category created successfully')
      }
      setShowModal(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed'
      toast.error(message)
    }
  }

  // Ensure categories is always an array before filtering
  const filteredCategories = Array.isArray(categories) ? categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : []

  const getCategoryHierarchy = (category) => {
    if (!category.parent) return category.name
    return `${category.parent.name} > ${category.name}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Organize your products into categories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null)
            setShowModal(true)
          }}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Category Image */}
            {category.image && (
              <div className="h-48 bg-gray-200">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
            
            {/* Category Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  {category.parent && (
                    <p className="text-sm text-gray-500 mb-2">
                      <FolderTree className="inline h-4 w-4 mr-1" />
                      {category.parent.name}
                    </p>
                  )}
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
                
                {/* Status Badge */}
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  category.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.status}
                </span>
              </div>

              {/* Category Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{category._count?.products || 0} products</span>
                {category._count?.children > 0 && (
                  <span>{category._count.children} subcategories</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingCategory(category)
                    setShowModal(true)
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No categories found' : 'No categories yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Get started by creating your first category.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingCategory(null)
                  setShowModal(true)
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      {showModal && (
        <CategoryForm
          category={editingCategory}
          categories={categories}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowModal(false)
            setEditingCategory(null)
          }}
          loading={false}
        />
      )}
    </div>
  )
}

export default AdminCategories