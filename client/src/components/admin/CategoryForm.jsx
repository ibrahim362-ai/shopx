import { useState, useEffect } from 'react'
import { X, Upload, Eye, EyeOff, Link } from 'lucide-react'
import ImageUpload from './ImageUpload'

const CategoryForm = ({ category, categories, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    status: 'ACTIVE',
    seoTitle: '',
    seoDescription: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showSeoFields, setShowSeoFields] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        parentId: category.parentId || '',
        status: category.status || 'ACTIVE',
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || ''
      })
      setSlugManuallyEdited(true)
      setShowSeoFields(!!(category.seoTitle || category.seoDescription))
    }
  }, [category])

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'name' && !slugManuallyEdited) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSlugChange = (e) => {
    const { value } = e.target
    setSlugManuallyEdited(true)
    setFormData(prev => ({
      ...prev,
      slug: generateSlug(value)
    }))
    
    if (errors.slug) {
      setErrors(prev => ({
        ...prev,
        slug: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Category name must be at least 3 characters'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Category name must be less than 100 characters'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }

    if (formData.description && formData.description.length > 300) {
      newErrors.description = 'Description must be less than 300 characters'
    }

    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid image URL'
    }

    if (formData.seoTitle && formData.seoTitle.length > 60) {
      newErrors.seoTitle = 'SEO title must be less than 60 characters'
    }

    if (formData.seoDescription && formData.seoDescription.length > 160) {
      newErrors.seoDescription = 'SEO description must be less than 160 characters'
    }

    if (formData.parentId && parseInt(formData.parentId) === category?.id) {
      newErrors.parentId = 'Category cannot be its own parent'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : null
      }
      
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null) {
          delete submitData[key]
        }
      })

      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  const availableParentCategories = categories.filter(cat => {
    if (category && cat.id === category.id) return false
    if (category && cat.parentId === category.id) return false
    return true
  })

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {category ? 'Edit Category' : 'Add Category'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter category name"
                maxLength={100}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.name.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.slug ? 'border-red-500' : ''}`}
                placeholder="category-slug"
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                URL-friendly version of the name
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Enter category description"
                maxLength={300}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.description.length}/300 characters
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Category Settings</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category Image
              </label>
              
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                folder="categories"
                placeholder="Upload category image or enter URL"
              />
              
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category
              </label>
              <select
                name="parentId"
                value={formData.parentId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.parentId ? 'border-red-500' : ''}`}
              >
                <option value="">None (Top Level)</option>
                {availableParentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.parentId && (
                <p className="text-red-500 text-sm mt-1">{errors.parentId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">SEO Settings</h4>
              <button
                type="button"
                onClick={() => setShowSeoFields(!showSeoFields)}
                className="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                {showSeoFields ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide SEO Fields
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show SEO Fields
                  </>
                )}
              </button>
            </div>

            {showSeoFields && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.seoTitle ? 'border-red-500' : ''}`}
                    placeholder="SEO optimized title"
                    maxLength={60}
                  />
                  {errors.seoTitle && (
                    <p className="text-red-500 text-sm mt-1">{errors.seoTitle}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.seoTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    rows={2}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.seoDescription ? 'border-red-500' : ''}`}
                    placeholder="SEO meta description"
                    maxLength={160}
                  />
                  {errors.seoDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.seoDescription}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.seoDescription.length}/160 characters
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading || uploadLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || uploadLoading}
            >
              {loading ? 'Saving...' : uploadLoading ? 'Uploading...' : (category ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryForm